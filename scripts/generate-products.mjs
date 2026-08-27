import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

function productSvg(name, color1, color2, emoji) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="bg-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <radialGradient id="cup-${name}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-${name})"/>
  <ellipse cx="200" cy="340" rx="90" ry="18" fill="#000" opacity="0.15"/>
  <path d="M130 120 Q200 80 270 120 L250 300 Q200 330 150 300 Z" fill="#fff" opacity="0.95"/>
  <path d="M130 120 Q200 80 270 120 L250 300 Q200 330 150 300 Z" fill="url(#cup-${name})"/>
  <rect x="155" y="95" width="90" height="30" rx="8" fill="#4B1B5C"/>
  <text x="200" y="280" text-anchor="middle" font-size="72">${emoji}</text>
  <circle cx="160" cy="180" r="4" fill="#fff" opacity="0.6"/>
  <circle cx="240" cy="200" r="3" fill="#fff" opacity="0.5"/>
  <circle cx="220" cy="160" r="5" fill="#fff" opacity="0.4"/>
</svg>`;
}

const products = [
  ["strawberry-fusion", "#E63946", "#FF6B6B", "🍓"],
  ["mango-passion", "#FFB703", "#FF9500", "🥭"],
  ["pineapple-ginger", "#F5B800", "#FF8C00", "🍍"],
  ["watermelon-mint", "#FF4757", "#2ECC71", "🍉"],
  ["mixed-berry", "#9B59B6", "#E63946", "🫐"],
  ["tropical-glow", "#FF6B35", "#FFB703", "🌴"],
  ["citrus-burst", "#FFA500", "#FFD700", "🍊"],
  ["green-vitality", "#2ECC71", "#27AE60", "🥬"],
];

const dir = join(process.cwd(), "public", "products");
mkdirSync(dir, { recursive: true });
for (const [slug, c1, c2, emoji] of products) {
  writeFileSync(join(dir, `${slug}.svg`), productSvg(slug, c1, c2, emoji));
}
console.log("Product SVGs created.");
