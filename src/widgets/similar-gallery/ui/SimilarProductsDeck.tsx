"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { DeckGallery, DeckGalleryItem } from "@/shared/ui/DeckGallery";
import { Product } from "@/entities/pet-product/model/types";

interface SimilarProductsDeckProps {
  /** Productos ya resueltos (p. ej. de `getRelatedProducts`). */
  products: Product[];
  /** Título de la sección; por defecto el editorial en dos líneas. */
  heading?: ReactNode;
  /** Descripción opcional bajo el título. */
  description?: string | null;
}

/**
 * Sección de productos relacionados presentada como mazo de cartas
 * (DeckGallery): se arrastra para barajar y un click en la carta frontal
 * navega al detalle del producto. Fondo cream con heading editorial navy,
 * al estilo gallery18 de shadcnblocks.
 */
export default function SimilarProductsDeck({
  products,
  heading,
  description,
}: SimilarProductsDeckProps) {
  const router = useRouter();

  const items: DeckGalleryItem[] = products.map((product) => ({
    src: product.img,
    alt: product.name,
    caption: captionFor(product),
  }));

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-cream text-slate-dark">
      <Container>
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center max-w-2xl whitespace-pre-line">
            {heading ?? (
              <>
                More souls,
                <br />
                framed.
              </>
            )}
          </h2>
          <p className="text-slate-dark/60 max-w-xl">
            {description ?? "Drag to shuffle the deck, tap a card to view it"}
          </p>
        </div>

        <DeckGallery
          items={items}
          className="w-64 md:w-96"
          onItemClick={(_item, i) => {
            // Los items se mapean 1:1 desde `products`, así que el índice coincide.
            const handle = products[i]?.shopifyHandle;
            if (handle) router.push(`/product/${handle}`);
          }}
        />
      </Container>
    </section>
  );
}

function captionFor(product: Product): string {
  return product.price ? `${product.name} · ${product.price}` : product.name;
}
