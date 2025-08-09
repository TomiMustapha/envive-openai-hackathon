import type { Route } from "./+types/api.products";
import { generateCatalog } from "../lib/products/generate";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const countParam = url.searchParams.get("count");
  const count = countParam ? Number(countParam) : 100;
  const safeCount = Number.isFinite(count) ? count : 100;

  const items = generateCatalog(safeCount);
  return Response.json(items);
} 