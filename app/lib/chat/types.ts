export type ChatRequest = {
  message: string;
};

import type { CatalogProduct } from "../products/types";

export type ChatResponse = {
  reply?: string;
  error?: string;
  products?: CatalogProduct[];
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Exclude<ChatRole, "system">;
  content: string;
};

export type AgentChatRequest = {
  messages: ChatMessage[];
  products?: CatalogProduct[] | unknown;
};

export type AgentEmailResponse = {
  message?: string;
  html?: string;
  error?: string;
  
}; 