"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import CanvasTemplate from "./CanvasTemplate";
import PosterTemplate from "./PosterTemplate";
import CreditsTemplate from "./CreditsTemplate";
import AccessoryTemplate from "./AccessoryTemplate";
import PBNTemplate from "./PBNTemplate";

/** Presentation applied to the product image based on the product type. */
export type FrameStyle = "canvas" | "poster" | "art";

export interface ProductTemplateProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
  handle: string;
  faqs: { q: string; a: string }[];
  frameStyle: FrameStyle;
}

const TEMPLATE_MAP: Record<string, ComponentType<ProductTemplateProps>> = {
  Canvas: CanvasTemplate,
  Poster: PosterTemplate,
  Credits: CreditsTemplate,
  Accessory: AccessoryTemplate,
  PBN: PBNTemplate,
};

// Only an explicit "Canvas"/"Poster" template gets a framed presentation; any
// other value (or an unknown one that falls back to CanvasTemplate) stays flat.
function toFrameStyle(template?: string | null): FrameStyle {
  if (template === "Canvas") return "canvas";
  if (template === "Poster") return "poster";
  return "art";
}

export default function ProductPageTemplate({
  templateOverride,
  ...props
}: Omit<ProductTemplateProps, "frameStyle"> & {
  templateOverride?: string | null;
}) {
  const Template = TEMPLATE_MAP[templateOverride ?? ""] ?? CanvasTemplate;
  return <Template {...props} frameStyle={toFrameStyle(templateOverride)} />;
}
