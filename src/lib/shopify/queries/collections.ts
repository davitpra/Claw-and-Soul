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

export const GET_COLLECTIONS_WITH_IMAGE = `
  query getCollectionsWithImage($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
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
            productType
            collections(first: 5) {
              edges {
                node {
                  title
                  handle
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
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
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
