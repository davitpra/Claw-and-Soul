import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

/**
 * Devuelve la URL de la imagen de la variante "set" opuesta a la seleccionada
 * (misma combinación de opciones excepto el valor de "Set"). null si no aplica.
 */
export function getOtherSetImage(
  product: ShopifyProduct,
  selectedVariant: ShopifyVariant | undefined,
): string | null {
  const setOption = selectedVariant?.selectedOptions.find(
    (o) => o.name.toLowerCase() === "set",
  );
  if (!setOption || !selectedVariant) return null;

  return (
    product.variants.edges.find(
      ({ node }) =>
        node.id !== selectedVariant.id &&
        node.selectedOptions.every((o) =>
          o.name.toLowerCase() === "set"
            ? o.value !== setOption.value
            : selectedVariant.selectedOptions.find((s) => s.name === o.name)
                ?.value === o.value,
        ),
    )?.node.image?.url ?? null
  );
}
