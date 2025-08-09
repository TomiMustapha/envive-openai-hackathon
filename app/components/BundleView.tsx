import React from "react";
import type { CatalogProduct } from "../lib/products/types";
import { useProducts } from "~/routes/page";


export function BundleView({ products }: { products: CatalogProduct[] }) {
  console.log(products);
  return (
    <div className="w-full">
    {products.length === 0 || products === undefined ? (
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        No products to display.
      </div>
    ) : (
      <div className="flex items-stretch flex-nowrap gap-2 overflow-hidden">
        {products.map((product, idx) => (
          <React.Fragment key={product["product-id"]}>
            <div className="flex-1 basis-0 min-w-0 flex flex-col h-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-3 py-3">
              <div className="h-32 w-full overflow-hidden rounded-md bg-gray-50 dark:bg-gray-800 mb-2 flex-none">
                <img
                  src={product["product-image"]}
                  alt={product["product-name"]}
                  className="h-full w-full object-cover"
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
        ))}
      </div>
    )}

    </div>
  );
}