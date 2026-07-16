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
  lifestyleImage?: {
    reference?: {
      field?: {
        reference?: { image?: ShopifyImage } | null;
      } | null;
    } | null;
  } | null;
}

/** Producto referenciado desde un metafield list.product_reference. */
export interface ShopifyProductReference {
  id: string;
  title: string;
  handle: string;
  /** Solo lo piden los queries que muestran la referencia como card de compra. */
  description?: string;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: { minVariantPrice: ShopifyPrice };
  /** Primera variante, para add-to-cart directo; solo la pide el query de related. */
  variants?: {
    edges: {
      node: Pick<ShopifyVariant, "id" | "title" | "availableForSale"> & {
        price?: ShopifyPrice;
      };
    }[];
  };
}

/** Metafield list.product_reference resuelto con `references`. */
export interface ShopifyProductReferences {
  references?: {
    edges: { node: ShopifyProductReference }[];
  } | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  /** Rich HTML body from the Shopify admin (sanitized by Shopify). */
  descriptionHtml?: string;
  thankYouImage?: {
    reference?: { image?: ShopifyImage } | null;
  } | null;
  /** Curados en Shopify vía Search & Discovery (related_products). */
  relatedProducts?: ShopifyProductReferences | null;
  /** Curados a mano en el metafield custom.similar_products. */
  similarProducts?: ShopifyProductReferences | null;
  priceRange?: {
    minVariantPrice: ShopifyPrice;
  };
  compareAtPriceRange?: {
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
