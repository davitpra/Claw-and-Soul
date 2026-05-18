"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import CanvasTemplate from "./CanvasTemplate";
import DefaultTemplate from "./DefaultTemplate";

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
};

export default function ProductPageTemplate(props: ProductTemplateProps) {
  const Template =
    TEMPLATE_MAP[props.product.productType] ?? DefaultTemplate;
  return <Template {...props} />;
}
