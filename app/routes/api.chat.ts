import type { Route } from "./+types/api.chat";
import type { ChatRequest, ChatResponse } from "../lib/chat/types";

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

    const apiKey = process.env.OPENAI_API_KEY;
    const shouldMock = process.env.MOCK_OPENAI === "true" || !apiKey;
    if (shouldMock) {
      const mock: ChatResponse = {
        reply: `Mock response: You said “${message}”.`,
      };
      return Response.json(mock);
    }

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
          { role: "user", content: message },
        ],
        temperature: 0.7,
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
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    return Response.json({ reply: reply ?? "No content returned." } satisfies ChatResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies ChatResponse, { status: 500 });
  }
} 