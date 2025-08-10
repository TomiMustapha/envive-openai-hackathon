import type { Route } from "./+types/api.chat";
import type { ChatRequest, ChatResponse } from "../lib/chat/types";
import { generateCatalog } from "../lib/products/generate";
import type { CatalogProduct } from "~/lib/products/types";

const chatContext: { role: string; content: string }[] = [];
const catalog = generateCatalog(100);

function maybeExtractCount(message: string): number | null {
  const match = message.match(/\b(\d{1,4})\b/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > 0) return Math.min(n, 1000);
  }
  return null;
}

function wantsProducts(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("product") || lower.includes("catalog");
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let message = "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Partial<ChatRequest>;
      message = (body.message ?? "").toString().trim();
    } else {
      const formData = await request.formData();
      message = (formData.get("message") || "").toString().trim();
    }

    if (!message) {
      return Response.json(
        { error: "Please provide a message." },
        { status: 400 }
      );
    }

    const wants = wantsProducts(message);
    const count = maybeExtractCount(message) ?? 100;

    const apiKey = process.env.OPENAI_API_KEY;
    const shouldMock = process.env.MOCK_OPENAI === "true" || !apiKey;
    if (shouldMock) {
      const mock: ChatResponse = {
        reply: `Mock response: You said “${message}”.` + (wants ? ` Generated ${count} products.` : ""),
        products: catalog.slice(0, 3),
      };
      return Response.json(mock);
    }
    chatContext.push({ role: "user", content: message });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are a helpful assistant who helps users create product bundles.
            You are also an expert email product template designer,
            you should only respond to requests or questions related to creating/updateing product bundles or creating/designing email campaigns,
            any other unrelated you should respond with a message that you are not able to help with that.

            When a user asks for generating a email campaign, use the most recent product bundle in the conversation history to generate the email campaign.
            If you don't see the product bundle in the conversation history, please ask the user to create a product bundle.
            ` },
          { role: "system", content: JSON.stringify(catalog) },
          { role: "system", content: "When a user asks for a product bundle, only returns products that are in the catalog." },
          { role: "system", content: `
            Here is the shape of a product:
              Product = {
                "product-id": string;
                "product-name": string;
                "product-description": string;
                "product-price": number;
                "product-quantity": number;
                "product-image": string;
                "product-category": string;
                "product-subcategory": string;
                "product-brand": string;
                "product-color": string;
                "product-size": string;
                "product-material": string;
                "product-style": string;
                "product-season": string;
                "product-fit": string;
                "product-occasion": string;
                "product-tags": string[];
                "product-attributes": Record<string, string>;
              }; 
         `},
          { role: "system", content: `
            Determine the user's intent from the conversation: create or modify a product bundle, generate/modify a email campaign,or other questions.
              Respond with exactly one JSON object using these rules:
              - For generate/modify product bundle: { "reply": string, "products": Product[] }.
              - For generate/modify a email campaign: { "reply": string, "html": string }.
              - For other questions: { "reply": string } answering the question concisely. Do NOT include products.`
          },
          { role: "system", content: `
            Please also ask some follow up questions to the user what they want to do next.
            Some quetions can be:
             - Do you want to create an email campaign out of this bundle?`
          },
          ...chatContext,
          { role: "user", content: message },
        ],
        reasoning_effort: "minimal"
        //temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: `OpenAI API error (${response.status}): ${text}` },
        { status: 502 }
      );
    }


    const data = await response.json();

    let res: string | undefined = data?.choices?.[0]?.message?.content;
    
    const result: ChatResponse = {
      content: res ?? "No content returned.",
    };
    chatContext.push({ role: "assistant", content: data.choices[0].message.content });

    return Response.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies ChatResponse, { status: 500 });
  }
} 