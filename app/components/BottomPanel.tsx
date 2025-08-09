import type { CatalogProduct } from "~/lib/products/types";
import { BundleView } from "./BundleView";

export function BottomPanel() {
  return (
    <section className="flex flex-col justify-center gap-6">
      <div className="flex items-center gap-3 pt-2">
        <BundleView />
      </div>
    </section>
  );
} 