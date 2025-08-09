import React from "react";

export function LeftPanel({ emailHtml }: { emailHtml?: string }) {
  return (
    <section className="flex flex-col justify-center gap-6">
      {emailHtml && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Live Email Preview</h3>
          <div
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            style={{ minHeight: 200 }}
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </div>
      )}
    </section>
  );
} 