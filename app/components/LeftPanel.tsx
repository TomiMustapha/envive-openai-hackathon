export function LeftPanel() {
  return (
    <section className="flex flex-col justify-center gap-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">AI Commerce Starter</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Generate product catalogs and chat with an AI assistant — all in one
          modern React Router app.
        </p>
      </div>

      <ul className="space-y-2">
        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">✓</span>
          Server-side API with mock mode for local dev
        </li>
        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">✓</span>
          Tailwind UI with dark mode support
        </li>
        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">✓</span>
          Reusable endpoints: products and chat
        </li>
      </ul>

      <div className="flex items-center gap-3 pt-2">
        <a
          href="/api/products?count=100"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Generate 100 Products
        </a>
        <a
          href="#chat"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Open Chat
        </a>
      </div>
    </section>
  );
} 