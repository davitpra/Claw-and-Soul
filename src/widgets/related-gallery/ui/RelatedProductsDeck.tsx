"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { DeckGallery, DeckGalleryItem } from "@/shared/ui/DeckGallery";
import { Product } from "@/entities/pet-product/model/types";

interface RelatedProductsDeckProps {
  /** Productos ya resueltos (p. ej. de `getRelatedProducts`). */
  products: Product[];
  /** Título de la sección. */
  heading: string;
  /** Descripción opcional bajo el título. */
  description?: string | null;
}

/**
 * Sección de productos relacionados presentada como mazo de cartas
 * (DeckGallery): se arrastra para barajar y un click en la carta frontal
 * navega al detalle del producto. Fondo oscuro para que el abanico destaque,
 * al estilo gallery18 de shadcnblocks.
 */
export default function RelatedProductsDeck({
  products,
  heading,
  description,
}: RelatedProductsDeckProps) {
  const router = useRouter();

  const items: DeckGalleryItem[] = products.map((product) => ({
    src: product.img,
    alt: product.name,
    caption: captionFor(product),
  }));

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-slate-dark text-white/90">
      <Container>
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <h2 className="font-display font-black text-white md:text-4xl">
            {heading}
          </h2>
          <p className="text-white/60 max-w-xl">
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
