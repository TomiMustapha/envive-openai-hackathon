import type { CatalogProduct } from "./types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number): number {
  // Return an integer price to match example schema
  return randomInt(min, max);
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function uniqueId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString().slice(-6);
  return `${prefix}${time}${rand}`.slice(0, 12);
}

const CATEGORIES = [
  { cat: "Apparel", sub: ["Tops", "Bottoms", "Outerwear",] },
  { cat: "Footwear", sub: ["Sneakers",] },
];

const BRANDS = [
  "Envive",
  "Northwind",
  "Acme",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
];

const COLORS = [
  "Black",
  "White",
  "Navy",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Beige",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MATERIALS = ["Cotton", "Polyester", "Wool", "Leather", "Denim", "Linen"];
const STYLES = ["Casual", "Formal", "Sport", "Street", "Classic", "Modern"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All-Season"];
const FITS = ["Slim", "Regular", "Relaxed", "Oversized", "Tailored"];
const OCCASIONS = ["Everyday", "Work", "Party", "Outdoor", "Travel", "Workout"];
const TAGS = [
  "New",
  "Bestseller",
  "Limited",
  "Organic",
  "Recycled",
  "Waterproof",
  "Lightweight",
  "Premium",
  "Budget",
  "Trending",
];

function placeholderImage(id: string): string {
  // Use a seeded picsum URL for variety
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/300/300`;
}




const PRODUCT_IMAGES: Record<string, string[]> = {
  Sneakers: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80"
  ],
  Tops: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8VCUyMHNoaXJ0fGVufDB8fDB8fHwy"
  ],
  Bottoms: [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGFudHN8ZW58MHx8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFudHN8ZW58MHx8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBhbnRzfGVufDB8fDB8fHwy"
  ],
  Outerwear: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8amFja2V0c3xlbnwwfHwwfHx8Mg%3D%3D",
    "https://images.unsplash.com/photo-1578948856697-db91d246b7b1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGphY2tldHN8ZW58MHx8MHx8fDI%3D",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGphY2tldHN8ZW58MHx8MHx8fDI%3D"
  ],
};



// Ensure we do not reuse the exact same URL across generated products
const usedImageUrls = new Set<string>();
function withUniqueParam(url: string, unique: string): string {
  return url.includes("?") ? `${url}&u=${unique}` : `${url}?u=${unique}`;
}
function pickUniqueImageForSub(sub: string, fallbackId: string): string | undefined {
  const pool = PRODUCT_IMAGES[sub] ?? [];
  for (const u of pool) {
    if (!usedImageUrls.has(u)) {
      usedImageUrls.add(u);
      return u;
    }
  }
  return undefined;
}

export function generateCatalogProduct(index?: number): CatalogProduct | undefined {
  const id = uniqueId(String(index ?? ""));
  const cat = pickRandom(CATEGORIES);
  const sub = pickRandom(cat.sub);
  const brand = pickRandom(BRANDS);
  const color = pickRandom(COLORS);
  const size = pickRandom(SIZES);
  const material = pickRandom(MATERIALS);
  const style = pickRandom(STYLES);
  const season = pickRandom(SEASONS);
  const fit = pickRandom(FITS);
  const occasion = pickRandom(OCCASIONS);

  const name = `${brand} ${style} ${sub}`;

  const productImage = pickUniqueImageForSub(sub, id);


  if (!productImage) {
    return undefined;
  }

  const product: CatalogProduct = {
    "product-id": id,
    "product-name": name,
    "product-description": `A ${style.toLowerCase()} ${sub.toLowerCase()} by ${brand} in ${color}.` ,
    "product-price": randomPrice(10, 100),
    "product-quantity": randomInt(0, 250),
    "product-image": productImage,
    "product-category": cat.cat,
    "product-subcategory": sub,
    "product-brand": brand,
    "product-color": color,
    "product-size": size,
    "product-material": material,
    "product-style": style,
    "product-season": season,
    "product-fit": fit,
    "product-occasion": occasion,
    "product-tags": Array.from(new Set([pickRandom(TAGS), pickRandom(TAGS), pickRandom(TAGS)])).slice(0, 3),
    "product-attributes": {
      attribute1: `Made of ${material}`,
      attribute2: `${style} fit: ${fit}`,
      attribute3: `Season: ${season}`,
    },
  };

  return product;
}

export function generateCatalog(count: number): CatalogProduct[] {
  const n = Math.max(1, Math.min(count, 1000));
  const results: CatalogProduct[] = [];
  for (let i = 0; i < n; i++) {
    const product = generateCatalogProduct(i);
    if (product) {
      results.push(product);
    }
  }
  return results;
} 