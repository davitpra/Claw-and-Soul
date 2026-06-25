// Constantes y tipos compartidos por las piezas de "Imágenes contextuales".
import type { ProductImageType } from "@/entities/admin/api";

export const TYPE_OPTIONS: { label: string; value: ProductImageType }[] = [
  { label: "Escena", value: "scene" },
  { label: "En uso", value: "in_use" },
  { label: "Explicativa", value: "explainer" },
  { label: "Galería", value: "gallery" },
  { label: "Gracias", value: "thanks" },
];

export const TYPE_LABEL: Record<ProductImageType, string> = {
  scene: "Escena",
  in_use: "En uso",
  explainer: "Explicativa",
  gallery: "Galería",
  thanks: "Gracias",
};

export const GENERAL_VALUE = "__general__";

export const bucketKey = (variantId: string | null) =>
  variantId ?? GENERAL_VALUE;

export type ProductVariant = {
  id: string;
  title: string;
  formatId: string;
  formatName: string;
  shopifyImageUrl?: string | null;
  shopifyImageAlt?: string | null;
};
