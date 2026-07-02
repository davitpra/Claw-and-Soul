// Ambient type declarations for spectral.js (MIT © 2025 Ronald van Wijnen).
// The package ships no types of its own. Mirrors its public UMD API.
// https://github.com/rvanwijnen/spectral.js
declare module "spectral.js" {
  export type ColorInput = string | number[];

  export class Color {
    /** sRGB triple as 0-255 integers. */
    sRGB: number[];
    lRGB: number[];
    /** Reflectance curve (38 spectral bins, 380-750 nm). */
    R: number[];
    XYZ: number[];
    luminance: number;
    tintingStrength: number;
    constructor(input: ColorInput);
    toString(opts?: { format?: "hex" | "rgb"; method?: "map" | "clip" }): string;
    inGamut(): boolean;
    toGamut(): Color;
  }

  /** Mix N colors like paint (subtractive), each with a relative weight. */
  export function mix(...colors: [Color, number][]): Color;
  export function palette(a: Color, b: Color, size: number): Color[];
  export function gradient(t: number, ...colors: [Color, number][]): Color;
}
