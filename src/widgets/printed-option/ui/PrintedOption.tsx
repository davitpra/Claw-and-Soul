"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { useProductStyle } from "@/hooks/useProductStyle";
import { useSameStyleProducts } from "@/hooks/useSameStyleProducts";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";
import { SetLighting } from "@/entities/product/ui/SetLighting";
import { setArtworkFilter } from "@/entities/product/lib/setLighting";

// Formatos físicos: fallback para datos legacy sin artKind asignado.
const PRINTED_TEMPLATES = ["Poster", "Canvas"];

interface PrintedOptionProps {
  /** Shopify handle of the current product; excluded from the CTA lookup. */
  handle?: string | null;
}

/**
 * Sección de cierre de las fichas de coloreables (artKind "pbn") para quien
 * prefiere no pintar: ofrece la misma obra como arte terminado listo para
 * colgar. The CTA points to a finished-art product (artKind "print") sharing
 * the current product's style; legacy products without an assigned artKind
 * fall back to any physical format (Canvas/Poster) that isn't itself a
 * paintable, and finally to the shop.
 */
export default function PrintedOption({ handle }: PrintedOptionProps) {
  const { styleId } = useProductStyle(handle ?? null);
  const { products } = useSameStyleProducts(styleId, handle);

  const printedProduct =
    products.find((p) => p.artKind === "print") ??
    products.find(
      (p) =>
        !p.artKind &&
        p.template != null &&
        PRINTED_TEMPLATES.includes(p.template),
    );
  const ctaHref = printedProduct
    ? `/product/${printedProduct.shopifyHandle}`
    : "/catalog";

  return (
    <section>
      <Container className="flex flex-col items-center gap-8 py-16 md:flex-row md:gap-16 md:py-0">
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <h2 className="font-display text-4xl font-black text-[#103642] leading-[1.1] tracking-tight mb-2 lg:mb-8">
            Love the art, not the brushes?
          </h2>
          <p className="font-body text-text-main">
            Not everyone wants to pick up a paintbrush — and that&apos;s okay.
            Get the exact same artwork as a ready-to-hang print, produced in
            ultra-high definition so every stroke and detail of the style stays
            crisp on your wall.
          </p>
          <div className="my-4 grid grid-cols-3 gap-4">
            {[
              { icon: "print", label: "Museum-quality print" },
              { icon: "high_quality", label: "Ultra-high definition" },
              { icon: "palette", label: "Same Art" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[24px]">
                    {icon}
                  </span>
                </span>
                <span className="text-sm font-medium text-[#103642]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={ctaHref}
            className="flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
          >
            Get it printed
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
        </div>
        {/* El mask vive en el wrapper (no en el <Image>) para que el fundido
            del borde derecho también afecte a la obra colgada encima. */}
        <div
          className="relative w-full overflow-hidden md:w-2/5"
          style={{
            maskImage: "linear-gradient(to left, transparent, black 15%)",
            WebkitMaskImage: "linear-gradient(to left, transparent, black 15%)",
          }}
        >
          <Image
            src="/set/Set3.png"
            alt="Framed ultra-high-definition pet portrait print in a cozy living room"
            width={1082}
            height={1454}
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-auto w-full"
          />
          {printedProduct && (
            // Obra colgada en la pared vacía del set (el suelo arranca al ~78%
            // de la altura). Presentación canvas fija (no según template): esta
            // sección vende el "ready-to-hang", aunque el print sea un póster.
            <div className="absolute left-[29%] top-[13%] w-[40%]">
              <SetLighting>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={printedProduct.img}
                  alt={printedProduct.name}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                  style={setArtworkFilter}
                />
                <CanvasEdgeOverlay />
              </SetLighting>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
