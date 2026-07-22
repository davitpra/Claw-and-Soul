"use client";

import { useState } from "react";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";
import { CatalogProduct } from "../model/types";

// Cuántos productos muestra una sección al inicio y cuántos añade cada "Show more".
const SECTION_PAGE_SIZE = 6;

interface CatalogSectionProps {
  /** Ancla para la barra de navegación por tipo (CatalogTypeNav). */
  id?: string;
  title: string;
  products: CatalogProduct[];
  /** Resuelve el href de cada card (kit PBN → /studio, etc.). */
  productHref: (product: CatalogProduct) => string | undefined;
}

/**
 * Una sección del catálogo: encabezado + grilla de productos de un mismo tipo, con
 * su propio "Show more" que expande solo esta sección (cada sección lleva su
 * estado por separado).
 */
export function CatalogSection({
  id,
  title,
  products,
  productHref,
}: CatalogSectionProps) {
  const [visibleCount, setVisibleCount] = useState(SECTION_PAGE_SIZE);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section id={id} className="mb-14 last:mb-0 scroll-mt-32 lg:scroll-mt-40">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-black text-secondary leading-tight">
          {title}
        </h2>
        <span className="text-sm font-bold text-text-muted">
          {products.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.shopifyHandle}
            product={product}
            href={productHref(product)}
            frameStyle={toFrameStyle(product.productType)}
            showPrice={true}
            showBadge={false}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => count + SECTION_PAGE_SIZE)}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-slate-dark text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              expand_more
            </span>
            Show more
          </button>
        </div>
      )}
    </section>
  );
}
