import { shopifyFetch } from "../client";
import { CREATE_CART } from "../queries/cart";

/**
 * Create a new checkout cart
 */
export async function createCart(input: any) {
  const response = await shopifyFetch<any>({
    query: CREATE_CART,
    variables: { input },
  });

  return response.data.cartCreate;
}
