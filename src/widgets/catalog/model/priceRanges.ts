import { StyleDifficulty } from "@/entities/art-style/model/difficulty";

// Orden fijo de las dificultades en el sidebar (de más fácil a más difícil).
export const DIFFICULTY_ORDER: StyleDifficulty[] = [
  "easy",
  "medium",
  "challenging",
];

// Rangos de precio del sidebar. `min` inclusivo, `max` exclusivo.
export const PRICE_RANGES = [
  { id: "under-25", label: "Under $25", min: 0, max: 25 },
  { id: "25-50", label: "$25 to $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 to $100", min: 50, max: 100 },
  { id: "over-100", label: "Over $100", min: 100, max: Infinity },
];

export const inPriceRange = (amount: number, rangeId: string) => {
  const range = PRICE_RANGES.find((r) => r.id === rangeId);
  return !!range && amount >= range.min && amount < range.max;
};
