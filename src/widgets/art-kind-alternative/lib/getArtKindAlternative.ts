import { ShopifyProduct } from "@/lib/shopify";
import { mapProductReferences } from "@/entities/product/lib/mapProductReferences";
import { resolveArtKind, type ArtKind } from "@/entities/product/model/artKind";
import { normalizeTemplate } from "@/entities/product/lib/template";
import type { Product } from "@/entities/pet-product/model/types";

// Orden de presentación de los formatos: del más "objeto" al más liviano, que
// es como se ordenan en el resto del storefront. Un template desconocido va al
// final. Sin esto las pills quedarían al orden en que se curó el metafield.
const TEMPLATE_ORDER = ["Canvas", "Poster", "Digital"];

function templateRank(template?: string | null): number {
  const index = TEMPLATE_ORDER.indexOf(normalizeTemplate(template));
  return index === -1 ? TEMPLATE_ORDER.length : index;
}

/**
 * La misma obra en el tipo de contenido contrario, curada a mano en Shopify vía
 * el metafield custom.alternative_products (list.product_reference). Es la única
 * fuente de la sección: sin metafield no hay sección.
 *
 * `target` sale de los propios productos curados —no del producto actual—, así
 * que la lista decide el copy, los perks y la escena (ver `alternativeCopy.ts`).
 * Las opciones que no coinciden con esa dirección se descartan para que las
 * pills y el copy no se contradigan si la curación viene mezclada.
 *
 * Vive aparte del componente para que `ArtProductTemplate` pueda decidir si la
 * sección se muestra: `SectionFlow` necesita saber qué bloques tienen contenido
 * antes de repartir los fondos, o la alternancia queda corrida.
 */
export function getArtKindAlternative(product: ShopifyProduct | null): {
  options: Product[];
  target: ArtKind | null;
} {
  // mapProductReferences ya excluye al propio producto; el handle es obligatorio
  // porque el CTA de la sección es un link a /product/<handle>.
  const referenced = mapProductReferences(
    product,
    product?.alternativeProducts,
  ).filter((p) => Boolean(p.shopifyHandle));

  const target =
    referenced.reduce<ArtKind | null>(
      (found, p) => found ?? resolveArtKind(p.template, p.artKind),
      null,
    ) ?? null;

  const options = target
    ? referenced
        .filter((p) => resolveArtKind(p.template, p.artKind) === target)
        .sort((a, b) => templateRank(a.template) - templateRank(b.template))
    : [];

  return { options, target };
}
