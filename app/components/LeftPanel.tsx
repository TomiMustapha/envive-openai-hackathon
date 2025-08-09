import React from "react";

export function LeftPanel({ emailHtml, isLoading }: { emailHtml?: string; isLoading?: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">Live Email Preview</h3>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden min-h-[240px]">
        {isLoading && !emailHtml ? (
          <div className="p-4 animate-pulse">
            <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-800 mb-3" />
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-800 mt-4" />
          </div>
        ) : emailHtml ? (
          <div className="[&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: emailHtml }} />
        ) : (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No email yet — ask the assistant to create one.
          </div>
        )}
      </div>
    </section>
  );
} 