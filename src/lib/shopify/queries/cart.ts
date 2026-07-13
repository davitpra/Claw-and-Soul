export const CREATE_CART = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        # Cart-level allocations only carry whole-cart discounts. The automatic
        # "Buy X Get Y" bundle discount is allocated per line, so the lines'
        # discountAllocations must be read too for the storefront savings row.
        # The title (discount name in Shopify admin) labels the savings in UI.
        discountAllocations {
          discountedAmount {
            amount
            currencyCode
          }
          ... on CartAutomaticDiscountAllocation {
            title
          }
        }
        lines(first: 50) {
          edges {
            node {
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
              discountAllocations {
                discountedAmount {
                  amount
                  currencyCode
                }
                ... on CartAutomaticDiscountAllocation {
                  title
                }
              }
            }
          }
        }
        discountCodes {
          code
          applicable
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
