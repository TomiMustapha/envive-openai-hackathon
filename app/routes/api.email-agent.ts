import type { Route } from "./+types/api.email-agent";
import type { AgentChatRequest, ChatMessage, AgentEmailResponse } from "../lib/chat/types";
import type { CatalogProduct } from "../lib/products/types";

function normalizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const result: ChatMessage[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      (item as any).role &&
      (item as any).content &&
      (typeof (item as any).role === "string") &&
      (typeof (item as any).content === "string") &&
      ((item as any).role === "user" || (item as any).role === "assistant")
    ) {
      result.push({ role: (item as any).role, content: (item as any).content });
    }
  }
  return result;
}

function parseProductsFromFirstUserMessage(messages: ChatMessage[]): CatalogProduct[] | null {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return null;
  try {
    const parsed = JSON.parse(firstUser.content);
    if (!Array.isArray(parsed)) return null;
    const products: CatalogProduct[] = [];
    for (const p of parsed) {
      if (p && typeof p === "object" && (p as any)["product-id"] && (p as any)["product-name"] && (p as any)["product-image"]) {
        products.push(p as CatalogProduct);
      }
      if (products.length === 5) break;
    }
    return products.length ? products.slice(0, 5) : null;
  } catch {
    return null;
  }
}

function sampleProducts(): CatalogProduct[] {
  return [
    {
      "product-id": "p1",
      "product-name": "Classic White T-Shirt",
      "product-description": "Soft cotton tee with a clean, timeless fit.",
      "product-price": 19.99,
      "product-quantity": 100,
      "product-image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "product-category": "clothing",
      "product-subcategory": "tops",
      "product-brand": "Acme",
      "product-color": "white",
      "product-size": "M",
      "product-material": "cotton",
      "product-style": "classic",
      "product-season": "all",
      "product-fit": "regular",
      "product-occasion": "casual",
      "product-tags": ["tee", "basic"],
      "product-attributes": {}
    },
    {
      "product-id": "p2",
      "product-name": "Denim Jacket",
      "product-description": "Medium wash, everyday layering essential.",
      "product-price": 79.99,
      "product-quantity": 50,
      "product-image": "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80",
      "product-category": "clothing",
      "product-subcategory": "outerwear",
      "product-brand": "Acme",
      "product-color": "blue",
      "product-size": "M",
      "product-material": "denim",
      "product-style": "casual",
      "product-season": "all",
      "product-fit": "regular",
      "product-occasion": "casual",
      "product-tags": ["denim", "jacket"],
      "product-attributes": {}
    },
    {
      "product-id": "p3",
      "product-name": "Athletic Joggers",
      "product-description": "Tapered fit with breathable stretch fabric.",
      "product-price": 49.99,
      "product-quantity": 80,
      "product-image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "product-category": "clothing",
      "product-subcategory": "pants",
      "product-brand": "Acme",
      "product-color": "gray",
      "product-size": "M",
      "product-material": "poly blend",
      "product-style": "athleisure",
      "product-season": "all",
      "product-fit": "tapered",
      "product-occasion": "casual",
      "product-tags": ["joggers", "sport"],
      "product-attributes": {}
    },
    {
      "product-id": "p4",
      "product-name": "Cozy Hoodie",
      "product-description": "Fleece-lined comfort for cool days.",
      "product-price": 59.99,
      "product-quantity": 60,
      "product-image": "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80",
      "product-category": "clothing",
      "product-subcategory": "tops",
      "product-brand": "Acme",
      "product-color": "black",
      "product-size": "M",
      "product-material": "fleece",
      "product-style": "casual",
      "product-season": "fall",
      "product-fit": "regular",
      "product-occasion": "casual",
      "product-tags": ["hoodie", "warm"],
      "product-attributes": {}
    },
    {
      "product-id": "p5",
      "product-name": "Everyday Sneakers",
      "product-description": "Versatile, lightweight, and durable.",
      "product-price": 69.99,
      "product-quantity": 120,
      "product-image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "product-category": "footwear",
      "product-subcategory": "sneakers",
      "product-brand": "Acme",
      "product-color": "white",
      "product-size": "10",
      "product-material": "synthetic",
      "product-style": "casual",
      "product-season": "all",
      "product-fit": "regular",
      "product-occasion": "casual",
      "product-tags": ["shoes", "daily"],
      "product-attributes": {}
    }
  ];
}

// Semantic intent classification removed — handled by model via system prompt

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let messages: ChatMessage[] = [];
    let productsFromBody: unknown = undefined;

    console.log('hello')

    if (contentType.includes("application/json")) {
        console.log(161);
      const body = (await request.json()) as Partial<AgentChatRequest> | unknown;
      productsFromBody = (body as any)?.products;
      console.log({body});
      const raw = (body as any)?.messages ?? body;
      messages = normalizeMessages(raw);
    } else {
        console.log(167);
      const formData = await request.formData();
      const raw = formData.get("messages");
      const rawProducts = formData.get("products");
      if (typeof rawProducts === "string") {
        try {
          productsFromBody = JSON.parse(rawProducts);
        } catch {
          productsFromBody = rawProducts;
        }
      }
      if (typeof raw === "string") {
        try {
          messages = normalizeMessages(JSON.parse(raw));
        } catch {}
      }
    }

    console.log(productsFromBody);

    if (!messages.length) {
      return Response.json(
        { error: "Please provide chat history as an array of messages." } satisfies AgentEmailResponse,
        { status: 400 }
      );
    }

    const products: CatalogProduct[] = (Array.isArray(productsFromBody) ? (productsFromBody as CatalogProduct[]) : parseProductsFromFirstUserMessage(messages)) ?? sampleProducts();

    const apiKey = process.env.OPENAI_API_KEY;
    const body = JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              `You are an expert email product template designer, you should only respond to requests or questions related to designing email campaigns, any other unrelated you should respond with a message that you are not able to help with that.
              You will receive a JSON array of up to 5 clothing products (with name, image URL, price, description).
              If you don't see the product information, please ask the user to provide the product information.

              
              Determine the user's intent from the conversation: generate/modify a email campaign, or other questions.
              Respond with exactly one JSON object using these rules:
              - For generate/modify: { "message": string, "html": string }. The html must be a fully exportable HTML document including <!doctype html>, <html>, <head> with a single <style> tag containing all CSS, and <body> with the email content. The message is a brief, non-technical 1–2 sentence summary of what you created.
              - For other questions: { "message": string } answering the question concisely. Do NOT include html.
              Do not include any markdown, code fences, or text outside of the JSON. Use only the provided image URLs when generating html.

              When updating/modifying the email campaign, change only what the user asked for, and keep the rest of the html as is.
              Assistant turns may contain a line starting with "PREVIOUS_EMAIL_HTML:" followed by the current HTML. Use this exact HTML as the starting point for modifications and preserve all unchanged parts.
              `,
          },
          { role: "user", content: JSON.stringify(products) },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        reasoning_effort: "minimal"
    })

    console.log(body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });


    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: `OpenAI API error (${response.status}): ${text}` } satisfies AgentEmailResponse,
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent: string | undefined = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return Response.json(
        { error: "Model returned no content." } satisfies AgentEmailResponse,
        { status: 502 }
      );
    }

    let payload: AgentEmailResponse | null = null;
    try {
      payload = JSON.parse(rawContent) as AgentEmailResponse;
    } catch {
      // Be tolerant: if the model returns plain text, surface it as the message
      payload = { message: rawContent.trim() };
    }

    if (!payload.message && typeof rawContent === "string" && rawContent.trim() && !rawContent.trim().startsWith("{")) {
      payload.message = rawContent.trim();
    }

    return Response.json(payload satisfies AgentEmailResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies AgentEmailResponse, { status: 500 });
  }
} 