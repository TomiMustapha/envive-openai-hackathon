import { useFetcher } from "react-router";
import { useEffect, useRef, useState } from "react";
import { LeftPanel } from "../components/LeftPanel";
import type { AgentEmailResponse, ChatMessage } from "../lib/chat/types";
import { useProducts } from "./page";
import { BottomPanel } from "~/components/BottomPanel";

// Using shared ChatMessage type from lib

export default function Home() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [emailHtml, setEmailHtml] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const {products} = useProducts();

  console.log({products});

  useEffect(() => {
    const data = fetcher.data as AgentEmailResponse | undefined;
    if (fetcher.state === "idle" && data) {
      if (data.message) {
        setHistory((prev) => [...prev, { role: "assistant", content: data.message! }]);
      }
      if (data.html) {
        setEmailHtml(data.html);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = (formData.get("message") || "").toString().trim();
    if (!content) return;

    const nextHistory: ChatMessage[] = [...history, { role: "user", content }];
    setHistory(nextHistory);

    const apiMessages: ChatMessage[] = nextHistory.map(({ role, content }) => ({ role, content }));
    if (emailHtml) {
      apiMessages.push({ role: "assistant", content: `PREVIOUS_EMAIL_HTML:\n${emailHtml}` });
    }
    fetcher.submit(
      { messages: apiMessages, products: products },
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

  return (
    <main className="min-h-[100dvh] p-6">
      {
        products.length > 0 && (
          <BottomPanel products={products} />
        )
      }
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        

        <section className="lg:pl-4">
          <div id="chat" className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur supports-[backdrop-filter]:bg-white/40 shadow-xl flex flex-col">
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

            <form className="sticky bottom-0 p-4 border-t border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-950/30 backdrop-blur supports-[backdrop-filter]:bg-white/40" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-4 py-3 shadow-sm">
                 <textarea
                   ref={inputRef}
                   name="message"
                   rows={1}
                   placeholder='Paste a JSON array of 5 clothing products, or just type a request like "make a summer promo"'
                   className="flex-1 resize-none bg-transparent border-0 outline-none focus:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-0"
                   required
                 />
                 </div>
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