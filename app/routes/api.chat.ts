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

// Define available tools
const tools = [
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform basic arithmetic operations (addition and subtraction) on two numbers",
      parameters: {
        type: "object",
        properties: {
          a: {
            type: "number",
            description: "The first number"
          },
          b: {
            type: "number",
            description: "The second number"
          },
          operation: {
            type: "string",
            enum: ["add", "subtract"],
            description: "The operation to perform: 'add' for addition, 'subtract' for subtraction"
          }
        },
        required: ["a", "b", "operation"]
      }
    }
  }
];

// Tool execution functions
async function executeCalculator(a: number, b: number, operation: string): Promise<number> {
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

async function executeToolCall(toolCall: any): Promise<string> {
  const { name, arguments: args } = toolCall.function;
  const parsedArgs = JSON.parse(args);

  switch (name) {
    case "calculator":
      const result = await executeCalculator(parsedArgs.a, parsedArgs.b, parsedArgs.operation);
      return result.toString();
    
    default:
      return `Unknown tool: ${name}`;
  }
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

    const apiKey = process.env.OPENAI_API_KEY;

    chatContext.push({ role: "user", content: message });

    // Tool calling loop
    let messages: any[] = [
      { role: "system", content: `You are a helpful assistant who helps users create product bundles.
        You are also an expert email product template designer

        When a user asks for generating a email campaign, use the most recent product bundle in the conversation history to generate the email campaign.
        If you don't see the product bundle in the conversation history, please ask the user to create a product bundle.
        
        You have access to a calculator tool if mathematical calculations are needed.

        If the user provides a money budget for a product bundle, follow this iterative process:
        1) Initialize current_sum = 0 and selected_products = [].
        2) Pick ONE product that best matches the user's query and constraints. After selecting it, call the calculator tool with { a: current_sum, b: product-price, operation: "add" } and set current_sum to the tool result.
        3) Repeat step 2 by adding ONE additional product at a time that best complements the selected_products according to the user's original query (e.g., style, category, season), each time updating current_sum using the calculator tool.
        4) Stop when adding another product would exceed the budget. Aim to get as close as possible to the budget WITHOUT exceeding it.
        5) Finally, respond with JSON containing the selected products (do not exceed the budget) and a brief reply summarizing the total and how close it is to the budget.
        ` },
      { role: "system", content: JSON.stringify(catalog) },
      { role: "system", content: "Only use products that exist in the provided catalog. Do not invent products." },
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
        Determine the user's intent from the conversation: create or modify a product bundle, generate/modify a email campaign, or other questions.
          Respond with exactly one JSON object using these rules:
          - For generate/modify product bundle: { "reply": string, "products": Product[] }.
          - For generate/modify a email campaign: { "reply": string, "html": string }.
          - For other questions: { "reply": string } answering the question concisely. Do NOT include products.
          When you believe the task is complete and no further tool calls are needed, include an additional key: { "status": "DONE" } in the same JSON object.
          Only call tools while reasoning; when you are done, return the final JSON without calling any tools.
          Return STRICTLY a single JSON object with no additional text or formatting outside the JSON.
          `
      },
      { role: "system", content: `
        Please also ask some follow up questions to the user what they want to do next.
        Some questions can be:
         - Do you want to create an email campaign out of this bundle?`
      },
      ...chatContext,
    ];

    let maxIterations = 20;
    let iteration = 0;

    while (iteration < maxIterations) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          tools,
          tool_choice: "auto",
          response_format: { type: "json_object" }
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
      const assistantMessage = data.choices[0].message;

      // Add assistant message to conversation
      messages.push(assistantMessage);

      // Check if there are tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log("Tool calls detected:", assistantMessage.tool_calls);
        
        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          console.log("Executing tool call:", toolCall);
          const toolResult = await executeToolCall(toolCall);
          console.log("Tool result:", toolResult);
          
          // Add tool result to conversation
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
          } as any);
        }
        
        iteration++;
        continue; // Continue the loop to get the next response
      } else {
        // No tool calls, we have a final response
        const finalContent = assistantMessage.content;
        
        console.log("Final response from LLM:", finalContent);
        
        try {
          // Try to parse as JSON first
          let jsonText = (finalContent ?? "").trim();
          if (!jsonText.startsWith("{") || !jsonText.endsWith("}")) {
            const first = jsonText.indexOf("{");
            const last = jsonText.lastIndexOf("}");
            if (first !== -1 && last !== -1 && last > first) {
              jsonText = jsonText.slice(first, last + 1);
            }
          }
          const parsedResponse = JSON.parse(jsonText);

          const result: ChatResponse = {
            reply: parsedResponse.reply || finalContent,
            products: parsedResponse.products,
            ...(parsedResponse.html && { html: parsedResponse.html })
          };

          const isDone = parsedResponse.status === "DONE";

          // Save all messages from this conversation to chatContext
          // Skip the system messages and the initial user message (already added)
          const conversationMessages = messages.slice(4); // Skip system messages
          for (const msg of conversationMessages) {
            if (msg.role === "assistant") {
              chatContext.push({ 
                role: "assistant", 
                content: msg.tool_calls ? 
                  `[Tool calls: ${msg.tool_calls.map((tc: any) => tc.function.name).join(', ')}]` : 
                  msg.content 
              });
            } else if (msg.role === "tool") {
              chatContext.push({ 
                role: "assistant", 
                content: `[Tool result: ${msg.content.substring(0, 200)}...]` 
              });
            }
          }

          // If assistant says DONE, or there's no explicit status field, treat this as final
          if (isDone || parsedResponse.status === undefined) {
            return Response.json(result);
          }

          // Otherwise, allow another iteration
          iteration++;
          continue;
        } catch (parseError) {
          // If not JSON, treat as plain text
          console.log("Not JSON, treating as plain text:", finalContent);
          
          const result: ChatResponse = {
            reply: finalContent ?? "No content returned.",
          };
          
          console.log("Plain text result:", result);
          
          // Save all messages from this conversation to chatContext
          const conversationMessages = messages.slice(4); // Skip system messages
          for (const msg of conversationMessages) {
            if (msg.role === "assistant") {
              chatContext.push({ 
                role: "assistant", 
                content: msg.tool_calls ? 
                  `[Tool calls: ${msg.tool_calls.map((tc: any) => tc.function.name).join(', ')}]` : 
                  msg.content 
              });
            } else if (msg.role === "tool") {
              chatContext.push({ 
                role: "assistant", 
                content: `[Tool result: ${msg.content.substring(0, 200)}...]` 
              });
            }
          }
          
          return Response.json(result);
        }
      }
    }

    // If we hit max iterations, return what we have
    return Response.json({
      reply: "I've reached the maximum number of tool calls. Please try rephrasing your request.",
      error: "Max iterations reached"
    } satisfies ChatResponse);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message } satisfies ChatResponse, { status: 500 });
  }
}