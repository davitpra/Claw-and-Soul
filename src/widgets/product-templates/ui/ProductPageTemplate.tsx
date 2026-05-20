"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import CanvasTemplate from "./CanvasTemplate";
import PosterTemplate from "./PosterTemplate";

export interface ProductTemplateProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
  handle: string;
  faqs: { q: string; a: string }[];
}

const TEMPLATE_MAP: Record<string, ComponentType<ProductTemplateProps>> = {
  Canvas: CanvasTemplate,
  Poster: PosterTemplate,
};

export default function ProductPageTemplate(props: ProductTemplateProps) {
  const Template = TEMPLATE_MAP[props.product.productType] ?? CanvasTemplate;
  return <Template {...props} />;
}
