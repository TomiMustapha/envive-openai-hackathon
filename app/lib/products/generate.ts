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
  { cat: "Apparel", sub: ["Tops", "Bottoms", "Outerwear", "Activewear", "Underwear"] },
  { cat: "Footwear", sub: ["Sneakers", "Boots", "Sandals", "Dress Shoes"] },
  { cat: "Accessories", sub: ["Bags", "Belts", "Hats", "Scarves", "Jewelry"] },
  { cat: "Home", sub: ["Decor", "Kitchen", "Bedding", "Bath"] },
  { cat: "Electronics", sub: ["Audio", "Smart Home", "Wearables", "Mobile"] },
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

export function generateCatalogProduct(index?: number): CatalogProduct {
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

  const product: CatalogProduct = {
    "product-id": id,
    "product-name": name,
    "product-description": `A ${style.toLowerCase()} ${sub.toLowerCase()} by ${brand} in ${color}.` ,
    "product-price": randomPrice(10, 100),
    "product-quantity": randomInt(0, 250),
    "product-image": "https://picsum.photos/200/300",
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
    results.push(generateCatalogProduct(i));
  }
  return results;
} 