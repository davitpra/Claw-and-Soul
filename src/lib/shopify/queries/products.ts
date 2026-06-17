export const GET_PRODUCTS = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
    id
    title
    handle
    description
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
}
`;
