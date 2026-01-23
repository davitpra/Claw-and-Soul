export const GET_METAOBJECTS = `
  query getMetaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          handle
          type
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;
