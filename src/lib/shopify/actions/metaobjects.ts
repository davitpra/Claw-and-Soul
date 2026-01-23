import { shopifyFetch } from "../client";
import { GET_METAOBJECTS } from "../queries/metaobjects";
import { ShopifyMetaobject } from "../types";

/**
 * Fetch metaobjects of a certain type
 */
export async function getMetaobjects(
  type: string,
  first: number = 20
): Promise<ShopifyMetaobject[]> {
  const response = await shopifyFetch<{
    metaobjects: { edges: { node: ShopifyMetaobject }[] };
  }>({
    query: GET_METAOBJECTS,
    variables: { type, first },
  });

  return response.data.metaobjects.edges.map((edge) => edge.node);
}
