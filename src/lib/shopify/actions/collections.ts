import { shopifyFetch } from "../client";
import {
  GET_COLLECTION,
  GET_COLLECTIONS_WITH_IMAGE,
} from "../queries/collections";
import { ShopifyCollection, ShopifyCollectionSummary } from "../types";

/** Forma cruda que devuelve la query, antes de resolver la portada. */
interface RawCollectionNode {
  id: string;
  handle: string;
  title: string;
  image: { url: string; altText: string | null } | null;
  products: {
    edges: { node: { featuredImage: { url: string; altText: string | null } | null } }[];
  };
}

/**
 * Fetch the store collections with a cover image, for category grids.
 * Si la colección no tiene imagen propia se usa la del primer producto; las que
 * no tienen ninguna se descartan (una card sin foto no tiene sentido).
 */
export async function getCollectionsWithImage(
  first: number = 12
): Promise<ShopifyCollectionSummary[]> {
  const response = await shopifyFetch<{
    collections: { edges: { node: RawCollectionNode }[] };
  }>({
    query: GET_COLLECTIONS_WITH_IMAGE,
    variables: { first },
  });

  const edges = response.data.collections?.edges ?? [];

  return edges.flatMap(({ node }) => {
    const fallback = node.products?.edges?.[0]?.node.featuredImage ?? null;
    const cover = node.image ?? fallback;
    if (!cover) return [];

    return [
      {
        id: node.id,
        handle: node.handle,
        title: node.title,
        imageUrl: cover.url,
        imageAlt: cover.altText,
      },
    ];
  });
}

/**
 * Fetch products from a specific collection
 */
export async function getCollectionProducts(
  handle: string,
  first: number = 20
): Promise<ShopifyCollection | null> {
  const response = await shopifyFetch<{ collection: ShopifyCollection }>({
    query: GET_COLLECTION,
    variables: { handle, first },
  });

  return response.data.collection || null;
}
