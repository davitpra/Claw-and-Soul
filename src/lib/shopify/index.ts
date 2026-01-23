export * from "./types";
export * from "./client";
export * from "./actions/products";
export * from "./actions/collections";
export * from "./actions/metaobjects";
export * from "./actions/cart";

// Re-export queries if needed, though usually actions are enough
import * as productsQueries from "./queries/products";
import * as collectionsQueries from "./queries/collections";
import * as metaobjectsQueries from "./queries/metaobjects";
import * as cartQueries from "./queries/cart";

export const GRAPHQL_QUERIES = {
  ...productsQueries,
  ...collectionsQueries,
  ...metaobjectsQueries,
  ...cartQueries,
};
