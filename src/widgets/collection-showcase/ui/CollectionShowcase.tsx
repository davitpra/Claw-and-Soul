"use client";

import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import ProductShowcase from "./ProductShowcase";

interface CollectionShowcaseProps {
  /** Handle de la colección de Shopify a mostrar. */
  handle?: string;
  /** Título a mostrar mientras la colección carga o si no tiene título. */
  fallbackTitle?: string;
  /** Texto del badge de cada tarjeta. Por defecto usa el título de la colección. */
  label?: string;
}

/**
 * Muestra los productos de una colección de Shopify. Es un wrapper delgado:
 * resuelve los datos con `useCollectionProducts` y delega el render en
 * `ProductShowcase` (presentacional, agnóstico a la fuente de datos).
 */
export default function CollectionShowcase({
  handle = "feature-collection",
  fallbackTitle = "Collections",
  label,
}: CollectionShowcaseProps) {
  const { products, title, description, isLoading, error } =
    useCollectionProducts(handle);

  const heading = title ? `${title}` : fallbackTitle;

  return (
    <ProductShowcase
      products={products}
      heading={heading}
      description={description}
      isLoading={isLoading}
      error={error}
      label={label ?? title ?? undefined}
    />
  );
}
