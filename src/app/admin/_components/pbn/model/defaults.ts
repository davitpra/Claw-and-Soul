import {
  getPreset,
  type InputOptionsInit,
  type RenderOptionsInit,
} from "@/features/pbn-studio";

/**
 * Dónde arranca el estudio admin. A diferencia del público, aquí el resultado se
 * imprime y se manda al cliente, así que prima la calidad sobre la velocidad:
 * abre en el preset `Balanced` (1024px, 16 colores, poda de facetas suave).
 *
 * Antes estos números estaban duplicados a mano y `narrowPixelCleanupRuns` había
 * quedado desalineado del preset, así que `isPresetActive` no marcaba ninguno al
 * abrir. Derivarlos de `getPreset` evita que vuelva a pasar.
 */
export const ADMIN_INPUT_DEFAULTS: InputOptionsInit = {
  resizeImage: true,
  ...getPreset("illustration"),
};

/** Relleno opaco: el admin revisa el resultado tal como se va a imprimir. */
export const ADMIN_RENDER_DEFAULTS: RenderOptionsInit = {
  fillOpacity: 1,
};
