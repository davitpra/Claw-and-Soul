"use client";

import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import { Product } from "@/entities/pet-product/model/types";

interface ProductShowcaseProps {
  /** Productos ya resueltos a mostrar. */
  products: Product[];
  /** Título de la sección. */
  heading: string;
  /** Descripción opcional bajo el título. */
  description?: string | null;
  /** Muestra esqueletos de carga en lugar de las tarjetas. */
  isLoading?: boolean;
  /** Mensaje de error; si existe, reemplaza a las tarjetas. */
  error?: string | null;
  /** Texto del badge de cada tarjeta. */
  label?: string;
}

/**
 * Sección presentacional de productos: agnóstica a la fuente de datos.
 * Recibe los productos ya resueltos y decide entre carrusel (>4) o grilla
 * centrada (≤4). La usan `CollectionShowcase` (colección de Shopify) y la
 * sección de productos relacionados de la página de producto.
 */
export default function ProductShowcase({
  products,
  heading,
  description,
  isLoading = false,
  error = null,
  label,
}: ProductShowcaseProps) {
  // Con más de 4 productos usamos carrusel; con 4 o menos, una grilla centrada.
  const useCarousel = products.length > 4;

  // Lista de tarjetas reutilizada por el carrusel y la grilla centrada. Dentro del
  // carrusel el ancho lo define `perView`; en la grilla lo define `className`.
  const renderCards = (className = "") =>
    products.map((product) => (
      <div
        key={product.productRefId ?? product.shopifyHandle}
        className={`min-w-0 self-center ${className}`}
      >
        <ProductCard product={product} label={label ?? "New"} />
      </div>
    ));

  // La grilla solo se ve en desktop (lg+), donde caben hasta 4 tarjetas por fila.
  const gridCardWidth = "lg:w-[calc((100%-6rem)/4)]";

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
          <Carousel gap="gap-8" perView={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden animate-pulse">
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
          <Carousel gap="gap-8" perView={4}>
            {renderCards()}
          </Carousel>
        )}

        {!error && !isLoading && !useCarousel && (
          <>
            {/* Mobile y tablet: siempre carrusel */}
            <div className="lg:hidden">
              <Carousel gap="gap-8" perView={4}>
                {renderCards()}
              </Carousel>
            </div>

            {/* Desktop: grilla centrada */}
            <div className="hidden lg:flex flex-wrap justify-center gap-8">
              {renderCards(gridCardWidth)}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
