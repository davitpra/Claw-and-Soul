import { shopifyFetch } from "../client";
import { GET_COLLECTION } from "../queries/collections";
import { ShopifyCollection } from "../types";

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
