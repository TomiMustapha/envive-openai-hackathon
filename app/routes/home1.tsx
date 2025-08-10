import { useFetcher } from "react-router";
import { useEffect, useRef, useState } from "react";
import type { ChatResponse } from "../lib/chat/types";
import { LeftPanel } from "../components/LeftPanel";
import type { CatalogProduct } from "~/lib/products/types";
import { BottomPanel } from "~/components/BottomPanel";
import { useProducts } from "./page";
import Message from "~/components/Message";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home1() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { products, setProducts: setProductsContext } = useProducts();
  const [emailHtml, setEmailHtml] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const data = fetcher.data
    if (fetcher.state === "idle" && data) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.content}]);
    }
    // if (fetcher.state === "idle" && data?.products) {
    //   setProductsContext(data.products as CatalogProduct[]);
    //   console.log(data.products);
    // }
    if (fetcher.state === "idle" && data) {
      console.log(data);
      const content = JSON.parse(data.content ?? "{}")
      if (content && content.html) {
        setEmailHtml(content.html);
      }
    }
  }, [fetcher.state, fetcher.data, setProductsContext]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = (formData.get("message") || "").toString().trim();
    if (!content) return;

    setMessages((prev) => [...prev, { role: "user", content }]);

    fetcher.submit(
      { message: content },
      { method: "post", action: "/api/chat", encType: "application/json" }
    );

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }, 0);
  };

  const errorMessage = (fetcher.data as ChatResponse | undefined)?.error;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <LeftPanel emailHtml={emailHtml} isLoading={isSubmitting} />
      <section className="lg:pl-4">
        <div id="chat" className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-medium">Chatbot</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start the conversation by sending a message.
              </p>
            ) : (
              messages.map((m, idx) => (
                <Message key={idx} message={m} />
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
                placeholder="Type your message…"
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
  );
}