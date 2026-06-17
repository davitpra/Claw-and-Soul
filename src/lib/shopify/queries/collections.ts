export const GET_COLLECTIONS = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export const GET_COLLECTION = `
  query getCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      description
      handle
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
          }
        }
      }
    }
  }
`;
