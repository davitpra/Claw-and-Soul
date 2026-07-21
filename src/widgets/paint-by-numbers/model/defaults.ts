import {
  getPreset,
  type InputOptionsInit,
  type RenderOptionsInit,
} from "@/features/pbn-studio";

/**
 * Where the public studio starts. It runs the whole pipeline in the visitor's
 * browser — often a phone — so it opens on the `Fast` preset: a 600px working
 * image, 12 colors and aggressive facet pruning. A style's saved `pbnConfig`
 * overrides these when the user arrives from a generation.
 */
export const STOREFRONT_INPUT_DEFAULTS: InputOptionsInit = {
  resizeImage: true,
  ...getPreset("photo"),
};

/**
 * Translucent fill so the numbers stay readable over the colored preview — the
 * public studio's output is something you look at before buying, not a print
 * proof. `sizeMultiplier` is left at its shared default (3): unlike the admin,
 * this surface exposes no control for it.
 */
export const STOREFRONT_RENDER_DEFAULTS: RenderOptionsInit = {
  fillOpacity: 0.3,
};
