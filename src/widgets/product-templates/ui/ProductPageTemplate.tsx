"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import CanvasTemplate from "./CanvasTemplate";
import PosterTemplate from "./PosterTemplate";
import CreditsTemplate from "./CreditsTemplate";
import AccessoryTemplate from "./AccessoryTemplate";
import PBNTemplate from "./PBNTemplate";

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
  Credits: CreditsTemplate,
  Accessory: AccessoryTemplate,
  PBN: PBNTemplate,
};

export default function ProductPageTemplate({
  templateOverride,
  ...props
}: ProductTemplateProps & { templateOverride?: string | null }) {
  const Template = TEMPLATE_MAP[templateOverride ?? ""] ?? CanvasTemplate;
  return <Template {...props} />;
}
