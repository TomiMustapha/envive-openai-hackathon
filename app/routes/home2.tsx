import type { Route } from "./+types/home";
import { useFetcher } from "react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { LeftPanel } from "../components/LeftPanel";
import type { AgentEmailResponse, ChatMessage } from "../lib/chat/types";
import { useProducts } from "./page";
import { BottomPanel } from "~/components/BottomPanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Envive | AI Chat" },
    { name: "description", content: "Landing page with an AI chatbot" },
  ];
}

// Using shared ChatMessage type from lib

export default function Home() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  type HistoryMessage = ChatMessage & { html?: string };
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const {products} = useProducts();

  useEffect(() => {
    const data = fetcher.data as AgentEmailResponse | undefined;
    if (fetcher.state === "idle" && data) {
      if (data.message || data.html) {
        setHistory((prev) => [
          ...prev,
          { role: "assistant", content: data.message ?? "", html: data.html },
        ]);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = (formData.get("message") || "").toString().trim();
    if (!content) return;

    const nextHistory: HistoryMessage[] = [...history, { role: "user", content }];
    setHistory(nextHistory);

    const apiMessages: ChatMessage[] = [];
    for (const m of nextHistory) {
      apiMessages.push({ role: m.role, content: m.content });
      if (m.role === "assistant" && m.html) {
        apiMessages.push({ role: "assistant", content: `PREVIOUS_EMAIL_HTML:\n${m.html}` });
      }
    }
    fetcher.submit(
      { messages: apiMessages },
      { method: "post", action: "/api/email-agent", encType: "application/json" }
    );

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }, 0);
  };

  const errorMessage = (fetcher.data as AgentEmailResponse | undefined)?.error;

  const emailHtml = useMemo(
    () => [...history].reverse().find((m) => m.html)?.html,
    [history]
  );

  return (
    <main className="min-h-[100dvh] p-6">
      {
        products.length > 0 && (
          <BottomPanel products={products} />
        )
      }
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeftPanel emailHtml={emailHtml} isLoading={isSubmitting} />

        <section className="lg:pl-4">
          <div id="chat" className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-medium">Chatbot</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start the conversation by sending a message.
                </p>
              ) : (
                history.map((m, idx) => (
                  <div
                    key={idx}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[80%] rounded-xl bg-blue-600 text-white px-3 py-2"
                        : "mr-auto max-w-[80%] rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
                    }
                  >
                    {m.content}
                  </div>
                ))
              )}
              {isSubmitting && (
                <div className="mr-auto max-w-[80%] rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 animate-pulse">
                  Thinking…
                </div>
              )}
              {fetcher.state === "idle" && errorMessage && (
                <div className="mr-auto max-w-[80%] rounded-xl border border-red-300/60 bg-red-50/60 dark:border-red-800/60 dark:bg-red-900/30 px-3 py-2 text-red-800 dark:text-red-200">
                  {errorMessage}
                </div>
              )}
            </div>

            <form className="p-3 border-t border-gray-100 dark:border-gray-800" onSubmit={handleSubmit}>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  name="message"
                  rows={2}
                  placeholder='Paste a JSON array of 5 clothing products, or just type a request like "make a summer promo"'
                  className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}