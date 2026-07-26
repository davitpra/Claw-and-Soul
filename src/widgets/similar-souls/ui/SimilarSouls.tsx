"use client";

import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Product } from "@/entities/pet-product/model/types";
import { SimilarSoulsCard } from "./SimilarSoulsCard";

interface SimilarSoulsProps {
  /** Productos similares ya resueltos (p. ej. de `getSimilarProducts`). */
  products: Product[];
  /** Destino del CTA final. */
  ctaHref?: string;
  /** Texto del CTA final. */
  ctaLabel?: string;
}

/**
 * Sección editorial "Similar Souls" de la página de producto: eyebrow pill,
 * título grande, subtítulo y un carrusel (3 por vista en desktop) de cards de
 * producto. Cierra con un divisor de huella y un CTA teal hacia la tienda.
 * Reutiliza el shell de `RelatedProducts` y el `Carousel` compartido (Embla).
 */
export default function SimilarSouls({
  products,
  ctaHref = "/catalog",
  ctaLabel = "Explore all styles",
}: SimilarSoulsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-cream">
      <Container>
        <div className="flex flex-col items-center gap-5 mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-white px-4 py-1.5 text-primary">
            <span className="material-symbols-outlined text-[16px]">
              favorite
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">
              More souls, framed
            </span>
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center">
            Similar Souls
          </h2>
          <p className="text-center text-text-muted max-w-xl leading-relaxed">
            Discover more custom portraits that bring personality, love, and
            artistry to life.
          </p>
        </div>

        {/* Padding horizontal para las flechas, que Embla pinta fuera del viewport. */}
        <div className="px-5">
          <Carousel gap="gap-8" perView={3}>
            {products.map((product) => (
              <div
                key={product.productRefId ?? product.shopifyHandle}
                className="min-w-0"
              >
                <SimilarSoulsCard product={product} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-primary">
            <span className="h-px w-16 bg-primary/30" />
            <span className="material-symbols-outlined text-[18px]">pets</span>
            <span className="h-px w-16 bg-primary/30" />
          </div>
          <p className="text-center text-text-muted">
            Every portrait is one-of-a-kind, just like your pet.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-colors"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
