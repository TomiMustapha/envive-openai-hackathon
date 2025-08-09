import type { Route } from "./+types/api.chat";
import type { ChatRequest, ChatResponse } from "../lib/chat/types";
import { generateCatalog } from "../lib/products/generate";
import type { CatalogProduct } from "~/lib/products/types";

const chatContext: { role: string; content: string }[] = [];
const catalog = generateCatalog(500);

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
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "system", content: JSON.stringify(catalog) },
          { role: "system", content: "When a user asks for a product, only returns products that are in the catalog." },
          { role: "system", content: "Always wrap the products json in a json object with the key \"products\"." },
          { role: "system", content: "Always keep the reply short and concise. Do not add any other text or comments." },
          { role: "system", content: "Always only return the products that are in the catalog. Do not make up products." },
          { role: "system", content: "Outfit creations should only include products that are in the catalog." },
          { role: "system", content: "Always return the products when making an outfit." },
          { role: "system", content: "Always respond in json format. The json should have a key \"products\" and the value should be an array of products.,and another key \"reply\" and the value should be the reply to the user's message." },
          ...chatContext,
          { role: "user", content: message },
        ],
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

    const parsedRes = JSON.parse(res ?? "{}");
    const products = parsedRes.products;
    const reply = parsedRes.reply;
    console.log(products);
    const productsArray = products as CatalogProduct[];

    const result: ChatResponse = {
      reply: reply ?? "No content returned.",
      products: productsArray,
    };
    chatContext.push({ role: "assistant", content: data.choices[0].message.content });

    return Response.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies ChatResponse, { status: 500 });
  }
} 