export const brand = {
  plum: "#6A1B9A",
  plumDark: "#4A148C",
  plumLight: "#8E24AA",
  gold: "#FFD600",
  goldWarm: "#FFC400",
  strawberry: "#E63946",
  leaf: "#2ECC71",
  orange: "#FF6B35",
  white: "#FFFFFF",
  cream: "#FFF8E7",
} as const;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatGhs(amount: number) {
  return `GH₵${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function ghsToPesewas(amount: number) {
  return Math.round(amount * 100);
}
