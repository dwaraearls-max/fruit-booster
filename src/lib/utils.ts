export const brand = {
  plum: "#6A1B9A",
  plumDark: "#4A148C",
  plumLight: "#8E24AA",
  gold: "#FFD600",
  goldWarm: "#FFC400",
  goldPale: "#FFF9C4",
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
