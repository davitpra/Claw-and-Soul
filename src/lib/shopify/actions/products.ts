import { shopifyFetch } from "../client";
import { GET_PRODUCT, GET_PRODUCTS } from "../queries/products";
import { ShopifyProduct } from "../types";

/**
 * Fetch a list of products
 */
export async function getProducts(
  first: number = 20,
): Promise<ShopifyProduct[]> {
  const response = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>({
    query: GET_PRODUCTS,
    variables: { first },
  });

  return response.data.products.edges.map((edge) => edge.node);
}

/**
 * Fetch a single product by handle
 */
export async function getProduct(
  handle: string,
): Promise<ShopifyProduct | null> {
  const response = await shopifyFetch<{ product: ShopifyProduct }>({
    query: GET_PRODUCT,
    variables: { handle },
  });

  return response.data.product || null;
}
