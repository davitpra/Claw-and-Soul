"use client";

import { ComponentType } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import ArtProductTemplate from "./ArtProductTemplate";
import CreditsTemplate from "./CreditsTemplate";
import AccessoryTemplate from "./AccessoryTemplate";
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
  /** Formato de entrega normalizado (Digital | Canvas | Poster…), para el label del tipo de producto. */
  template: string;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); undefined si no está asignado. */
  artKind?: string | null;
}

// Los tres formatos de arte comparten una sola página: ArtProductTemplate ya
// resuelve sus diferencias a partir de `template` y `artKind` (ver
// `model/artTemplateConfig.ts`). Credits y Accessory no entran al flujo de
// personalización y tienen layout propio, así que siguen aparte.
const TEMPLATE_MAP: Record<string, ComponentType<ProductTemplateProps>> = {
  Digital: ArtProductTemplate,
  Canvas: ArtProductTemplate,
  Poster: ArtProductTemplate,
  Credits: CreditsTemplate,
  Accessory: AccessoryTemplate,
};

export default function ProductPageTemplate({
  templateOverride,
  ...props
}: Omit<ProductTemplateProps, "frameStyle" | "template"> & {
  templateOverride?: string | null;
}) {
  // normalizeTemplate absorbe el valor legacy "PBN" (alias de "Digital").
  const template = normalizeTemplate(templateOverride);
  const Template = TEMPLATE_MAP[template] ?? ArtProductTemplate;
  return (
    <Template {...props} template={template} frameStyle={toFrameStyle(template)} />
  );
}
