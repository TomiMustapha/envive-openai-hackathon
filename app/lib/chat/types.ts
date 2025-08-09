export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  reply?: string;
  error?: string;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Exclude<ChatRole, "system">;
  content: string;
};

export type AgentChatRequest = {
  messages: ChatMessage[];
};

export type Product = {
  id?: string;
  name: string;
  image: string;
  price?: number | string;
  description?: string;
};

export type AgentEmailResponse = {
  message?: string;
  html?: string;
  error?: string;
}; 