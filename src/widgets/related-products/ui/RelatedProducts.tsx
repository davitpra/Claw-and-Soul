"use client";

import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { AccessoryUpsell, type AccessoryCard } from "@/features/pbn-purchase";

interface RelatedProductsProps {
  /** Cards ya resueltas (p. ej. de `getRelatedAccessories`). */
  accessories: AccessoryCard[];
  heading?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

/**
 * Sección de productos relacionados sobre fondo cream: heading editorial
 * centrado y carrusel con flechas de cards de compra directa (AccessoryUpsell,
 * las mismas del cross-sell de PBN), dos por vista en desktop. Cierra con un
 * divisor de huella y CTA teal hacia la tienda.
 */
export default function RelatedProducts({
  accessories,
  heading = "More souls, framed.",
  ctaHref = "/shop",
  ctaLabel = "View all styles",
}: RelatedProductsProps) {
  if (accessories.length === 0) return null;

  return (
    <section className="py-20 bg-cream">
      <Container>
        <div className="flex flex-col items-center gap-5 mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-white px-4 py-1.5 text-primary">
            <span className="material-symbols-outlined text-[16px]">
              favorite
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">
              Perfect companions
            </span>
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center max-w-2xl whitespace-pre-line">
            {heading}
          </h2>
          <p className="text-center text-text-muted max-w-xl leading-relaxed">
            Complete your art experience with our premium painting essentials —
            made for lasting memories.
          </p>
        </div>

        {/* Padding horizontal para las flechas, que Embla pinta fuera del viewport. */}
        <div className="px-5">
          <Carousel gap="gap-6">
            {accessories.map((accessory) => (
              <div
                key={accessory.productId}
                className="min-w-0 flex-[0_0_100%] lg:flex-[0_0_calc((100%-1.5rem)/2)]"
              >
                <AccessoryUpsell accessory={accessory} />
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
            Everything you need to turn memories into masterpieces.
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
