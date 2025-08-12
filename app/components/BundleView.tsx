import React from "react";
import type { CatalogProduct } from "../lib/products/types";
import { useProducts } from "~/routes/page";

function getFallbackImage(product: CatalogProduct): string {
  const seed = encodeURIComponent(product["product-id"] ?? product["product-name"] ?? "image");
  return `https://picsum.photos/seed/${seed}/300/300`;
}

function resolveImage(product: CatalogProduct): { src: string; fallback: string } {
  const raw = product["product-image"];
  const fallback = getFallbackImage(product);
  if (typeof raw === "string" && /^https?:\/\//i.test(raw)) {
    return { src: raw, fallback };
  }
  return { src: fallback, fallback };
}

export function BundleView({ products }: { products: CatalogProduct[] }) {
  console.log(products);
  return (
    <div className="w-full">
    {products.length === 0 || products === undefined ? (
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        No products to display.
      </div>
    ) : (
      <div className="flex items-stretch flex-nowrap gap-2 overflow-x-auto overflow-y-hidden">
        {products.map((product, idx) => {
          const { src, fallback } = resolveImage(product);
          return (
            <React.Fragment key={product["product-id"]}>
              <div className="flex-none w-64 flex flex-col h-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-3 py-3">
                <div className="h-32 w-full overflow-hidden rounded-md bg-gray-50 dark:bg-gray-800 mb-2 flex-none">
                  <img
                    src={src}
                    alt={product["product-name"]}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src !== fallback) img.src = fallback;
                    }}
                  />
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1 truncate">
                  {product["product-name"]}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5 overflow-hidden">
                  <div className="truncate">
                    <span className="font-medium">ID:</span> {product["product-id"]}
                  </div>
                  {product["product-category"] && (
                    <div className="truncate">
                      <span className="font-medium">Category:</span> {product["product-category"]}
                    </div>
                  )}
                  {product["product-price"] !== undefined && (
                    <div>
                      <span className="font-medium">Price:</span> ${product["product-price"].toFixed(2)}
                    </div>
                  )}
                  {product["product-description"] && (
                    <div className="mt-1 text-gray-500 dark:text-gray-400 text-[11px] leading-snug line-clamp-2">
                      {product["product-description"]}
                    </div>
                  )}
                </div>
              </div>
              {idx < products.length - 1 && (
                <div className="flex-none h-72 px-1 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600 select-none">+</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    )}

    </div>
  );
}