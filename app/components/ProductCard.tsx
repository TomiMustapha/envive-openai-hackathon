import type { CatalogProduct } from "../lib/products/types";

type ProductCardProps = {
  product: CatalogProduct;
  onRemove?: (productId: string) => void;
};

export function ProductCard({ product, onRemove }: ProductCardProps) {
  const id = product["product-id"];
  const name = product["product-name"];
  const brand = product["product-brand"];
  const image = product["product-image"];
  const price = product["product-price"];

  return (
    <div className="relative w-56 shrink-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {onRemove && (
        <button
          type="button"
          aria-label="Remove from bundle"
          onClick={() => onRemove(id)}
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200/70 dark:border-gray-700/70 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
        >
          ×
        </button>
      )}
      <div className="aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm text-gray-500 dark:text-gray-400">{brand}</div>
        <div className="font-medium leading-snug line-clamp-2">{name}</div>
        <div className="text-blue-600 dark:text-blue-400 font-semibold">${price}</div>
      </div>
    </div>
  );
} 