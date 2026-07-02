/**
 * Thin wrapper over spectral.js (MIT © 2025 Ronald van Wijnen) exposing the
 * pigment-mixing primitives the recipe search needs.
 *
 * spectral.js mixes colors like real paint (subtractive, Kubelka-Munk) instead
 * of like light (additive RGB): yellow + blue = green. It replaces the former
 * Mixbox vendor module, whose CC BY-NC 4.0 license forbade commercial use.
 *
 * The recipe search converts each base paint to a `Pigment` once, then mixes
 * pigments with arbitrary weights thousands of times — so `rgbToPigment` is the
 * one-time precompute and `mixPigments` is the hot path.
 */
import * as spectral from "spectral.js";

/** A color in spectral.js's pigment representation (reflectance + KS). */
export type Pigment = spectral.Color;

/** Convert an sRGB triple (0-255) to a reusable pigment. Precompute once. */
export function rgbToPigment(rgb: number[]): Pigment {
  return new spectral.Color([rgb[0], rgb[1], rgb[2]]);
}

function clamp255(x: number): number {
  return x < 0 ? 0 : x > 255 ? 255 : x;
}

/** Read the resulting sRGB triple (0-255 integers) out of a pigment. */
export function pigmentToRgb(p: Pigment): [number, number, number] {
  const [r, g, b] = p.sRGB;
  return [clamp255(r) | 0, clamp255(g) | 0, clamp255(b) | 0];
}

/**
 * Mix pigments with the given (relative) weights, like combining parts of
 * paint. Weights need not sum to 1. Requires at least one pigment.
 */
export function mixPigments(pigments: Pigment[], weights: number[]): Pigment {
  const pairs = pigments.map((p, i) => [p, weights[i]] as [Pigment, number]);
  return spectral.mix(...pairs);
}
