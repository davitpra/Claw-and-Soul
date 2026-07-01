import { ShopifyVariant } from "@/lib/shopify";

/**
 * URL de la imagen "Size life style" o null. El metafield de variante
 * (custom.size_life_style) referencia un Metaobject tipo `size_life_style`; la
 * foto vive en su campo `lifestyle_render` (file_reference → MediaImage).
 */
export function getLifestyleImage(
  variant: ShopifyVariant | undefined,
): string | null {
  return (
    variant?.lifestyleImage?.reference?.field?.reference?.image?.url ?? null
  );
}
