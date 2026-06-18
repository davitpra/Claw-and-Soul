"use client";

import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";

interface CollectionShowcaseProps {
  /** Handle de la colección de Shopify a mostrar. */
  handle?: string;
  /** Título a mostrar mientras la colección carga o si no tiene título. */
  fallbackTitle?: string;
  /** Texto del badge de cada tarjeta. Por defecto usa el título de la colección. */
  label?: string;
}

export default function CollectionShowcase({
  handle = "feature-collection",
  fallbackTitle = "Collections",
  label,
}: CollectionShowcaseProps) {
  const { products, title, description, isLoading, error } =
    useCollectionProducts(handle);

  // Con más de 4 productos usamos carrusel; con 4 o menos, una grilla centrada.
  const useCarousel = products.length > 4;
  const heading = title ? `${title}` : fallbackTitle;

  // Lista de tarjetas reutilizada por el carrusel y la grilla centrada.
  // El ancho del item lo define este wrapper (la tarjeta es agnóstica al ancho).
  const cards = products.map((product) => (
    <div
      key={product.productRefId ?? product.shopifyHandle}
      className="flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0"
    >
      <ProductCard product={product} label={label ?? title ?? "New"} />
    </div>
  ));

  return (
    <section className="py-20 bg-white">
      <Container>
        <div
          className={`flex flex-col items-center ${useCarousel ? "md:items-start" : "md:items-center"} gap-4 mb-8`}
        >
          <h2 className="font-display font-black text-slate-dark md:text-4xl">
            {heading}
          </h2>
          {description && (
            <p className="mt-2 text-lg text-slate-dark/60 text-center">
              {description}
            </p>
          )}
        </div>

        {error && <p className="text-center text-slate-dark/60">{error}</p>}

        {!error && isLoading && (
          <Carousel gap="gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0 overflow-hidden animate-pulse"
              >
                <div className="aspect-4/5 w-full bg-slate-dark/10" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 mx-auto bg-slate-dark/10 rounded" />
                  <div className="h-3 w-1/3 mx-auto bg-slate-dark/10 rounded" />
                </div>
              </div>
            ))}
          </Carousel>
        )}

        {!error && !isLoading && useCarousel && (
          <Carousel gap="gap-8">{cards}</Carousel>
        )}

        {!error && !isLoading && !useCarousel && (
          <>
            {/* Mobile y tablet: siempre carrusel */}
            <div className="lg:hidden">
              <Carousel gap="gap-8">{cards}</Carousel>
            </div>

            {/* Desktop: grilla centrada */}
            <div className="hidden lg:flex flex-wrap justify-center gap-8">
              {cards}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
