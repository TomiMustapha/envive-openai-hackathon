import type { Route } from "./+types/api.email-agent";
import type { AgentChatRequest, ChatMessage, AgentEmailResponse, Product } from "../lib/chat/types";

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

function parseProductsFromFirstUserMessage(messages: ChatMessage[]): Product[] | null {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return null;
  try {
    const parsed = JSON.parse(firstUser.content);
    if (!Array.isArray(parsed)) return null;
    const products: Product[] = [];
    for (const p of parsed) {
      if (
        p &&
        typeof p === "object" &&
        typeof (p as any).name === "string" &&
        typeof (p as any).image === "string"
      ) {
        products.push({
          id: (p as any).id,
          name: (p as any).name,
          image: (p as any).image,
          price: (p as any).price,
          description: (p as any).description,
        });
      }
      if (products.length === 5) break;
    }
    return products.length ? products.slice(0, 5) : null;
  } catch {
    return null;
  }
}

function sampleProducts(): Product[] {
  return [
    { id: "p1", name: "Classic White T-Shirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", price: 19.99, description: "Soft cotton tee with a clean, timeless fit." },
    { id: "p2", name: "Denim Jacket", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80", price: 79.99, description: "Medium wash, everyday layering essential." },
    { id: "p3", name: "Athletic Joggers", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", price: 49.99, description: "Tapered fit with breathable stretch fabric." },
    { id: "p4", name: "Cozy Hoodie", image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80", price: 59.99, description: "Fleece-lined comfort for cool days." },
    { id: "p5", name: "Everyday Sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", price: 69.99, description: "Versatile, lightweight, and durable." },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let messages: ChatMessage[] = [];

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Partial<AgentChatRequest> | unknown;
      const raw = (body as any)?.messages ?? body;
      messages = normalizeMessages(raw);
    } else {
      const formData = await request.formData();
      const raw = formData.get("messages");
      if (typeof raw === "string") {
        try {
          messages = normalizeMessages(JSON.parse(raw));
        } catch {}
      }
    }

    if (!messages.length) {
      return Response.json(
        { error: "Please provide chat history as an array of messages." } satisfies AgentEmailResponse,
        { status: 400 }
      );
    }

    const products = parseProductsFromFirstUserMessage(messages) ?? sampleProducts();

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              `You are an expert email product template designer.
              You will receive a JSON array of up to 5 clothing products (with name, image URL, price, description).
              Create a professional promotional email based on these products. Output strictly a single JSON object with keys: message, html.
              The html must be a fully exportable HTML document including <!doctype html>, <html>, <head> with a single <style> tag containing all CSS, and <body> with the email content.
              Do not include any markdown, code fences, or text outside of the JSON. Use only the provided image URLs.
              `,
          },
          { role: "user", content: JSON.stringify(products) },
          ...messages.filter((m) => m.role !== "user" || m !== messages[0]).map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
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
      return Response.json(
        { error: "Model returned non-JSON content. Please retry." } satisfies AgentEmailResponse,
        { status: 502 }
      );
    }

    if (!payload?.html) {
      return Response.json(
        { error: "Model did not include html in the response." } satisfies AgentEmailResponse,
        { status: 502 }
      );
    }

    return Response.json(payload satisfies AgentEmailResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies AgentEmailResponse, { status: 500 });
  }
} 