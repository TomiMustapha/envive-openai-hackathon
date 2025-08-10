import type { CatalogProduct } from "~/lib/products/types";
import { BundleView } from "./BundleView";

export function BottomPanel({ products, isLoading }: { products: CatalogProduct[]; isLoading?: boolean }) {
  return (
    <section className="flex flex-col justify-center gap-6">
      <div className="flex items-center gap-3 pt-2">
        {isLoading ? (
          <div className="flex items-stretch flex-nowrap gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center">
                <div className="flex-1 basis-0 min-w-0 flex flex-col h-72 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-3 py-3 animate-pulse">
                  <div className="h-32 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 mb-2 flex-none" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                {i < 2 && (
                  <div className="flex-none h-72 px-1 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400/60 select-none">+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <BundleView products={products} />
        )}
      </div>
    </section>
  );
} 