"use client";

import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Card } from "@/shared/ui/Card";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { Product } from "@/entities/pet-product/model/types";

// Aspecto de "poster flotando": ligera elevación y sombra teñida en teal al hover.
const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

// Tarjeta de producto reutilizable (usada tanto en el carrusel como en la grilla centrada).
function ProductCard({ product, label }: { product: Product; label?: string }) {
  return (
    <div className="group flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0 flex flex-col gap-4">
      <Link href={`/product/${product.shopifyHandle}`} className="block">
        <Card
          imageUrl={product.img}
          imageAlt={product.name}
          naturalAspect
          className={posterClasses}
        >
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
            {label || product.label || "New"}
          </span>
        </Card>
      </Link>
      <div className="flex items-center justify-center">
        <h3 className="font-black text-slate-dark md:text-lg font-display">
          {product.name}
        </h3>
      </div>
    </div>
  );
}

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
  const cards = products.map((product) => (
    <ProductCard
      key={product.productRefId ?? product.shopifyHandle}
      product={product}
      label={label ?? title ?? undefined}
    />
  ));

  return (
    <section className="py-20 bg-white">
      <Container>
        <div
          className={`flex flex-col items-center ${useCarousel ? "md:items-start" : "md:items-center"} gap-4 mb-8`}
        >
          <h2 className="font-black text-slate-dark md:text-4xl font-display">
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
