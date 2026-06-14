import { ProductContextualImage } from "@/hooks/useFormatOptions";

/**
 * Resuelve la imagen de escena para la variante seleccionada a partir de las
 * imágenes contextuales (app-owned). Prioriza la escena propia de la variante;
 * si no hay, cae en la escena "General" (sin variante). Dentro de cada nivel
 * elige la primaria y luego por orderIndex. Devuelve null si no hay ninguna.
 */
export function getSceneImage(
  images: ProductContextualImage[],
  selectedVariantId: string,
): string | null {
  const scenes = images.filter((i) => i.type === "scene");
  const pick = (arr: ProductContextualImage[]) =>
    [...arr].sort(
      (a, b) =>
        Number(b.isPrimary) - Number(a.isPrimary) || a.orderIndex - b.orderIndex,
    )[0]?.imageUrl ?? null;

  const variantScene = pick(
    scenes.filter((i) => i.shopifyVariantId === selectedVariantId),
  );
  return variantScene ?? pick(scenes.filter((i) => i.shopifyVariantId === null));
}
