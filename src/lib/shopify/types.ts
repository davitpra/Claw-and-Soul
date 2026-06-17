export interface ShopifyImage {
  url: string;
  altText: string;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: ShopifyPrice;
  compareAtPrice: ShopifyPrice | null;
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange?: {
    minVariantPrice: ShopifyPrice;
  };
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: {
      node: ShopifyVariant;
    }[];
  };
  collections?: {
    edges: { node: { title: string } }[];
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  description: string;
  handle: string;
  products: {
    edges: { node: ShopifyProduct }[];
  };
}

export interface ShopifyMetaobject {
  id: string;
  handle: string;
  type: string;
  fields: {
    key: string;
    value: string;
    reference?:
      | {
          image?: {
            url: string;
          };
        }
      | any;
  }[];
}
