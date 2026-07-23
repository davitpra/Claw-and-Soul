"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import CanvasTemplate from "./CanvasTemplate";
import PosterTemplate from "./PosterTemplate";
import CreditsTemplate from "./CreditsTemplate";
import AccessoryTemplate from "./AccessoryTemplate";
import DigitalTemplate from "./DigitalTemplate";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";
import { normalizeTemplate } from "@/entities/product/lib/template";
import type { FrameStyle } from "@/entities/product/lib/frameStyle";

export interface ProductTemplateProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
  handle: string;
  faqs: { q: string; a: string }[];
  frameStyle: FrameStyle;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); undefined si no está asignado. */
  artKind?: string | null;
}

// Un template por formato de entrega. El contenido (coloreable vs arte
// terminado) llega aparte en `artKind` y condiciona bloques dentro de cada uno.
const TEMPLATE_MAP: Record<string, ComponentType<ProductTemplateProps>> = {
  Digital: DigitalTemplate,
  Canvas: CanvasTemplate,
  Poster: PosterTemplate,
  Credits: CreditsTemplate,
  Accessory: AccessoryTemplate,
};

export default function ProductPageTemplate({
  templateOverride,
  ...props
}: Omit<ProductTemplateProps, "frameStyle"> & {
  templateOverride?: string | null;
}) {
  // normalizeTemplate absorbe el valor legacy "PBN" (alias de "Digital").
  const template = normalizeTemplate(templateOverride);
  const Template = TEMPLATE_MAP[template] ?? CanvasTemplate;
  return <Template {...props} frameStyle={toFrameStyle(template)} />;
}
