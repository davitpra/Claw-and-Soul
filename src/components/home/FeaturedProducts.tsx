"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { useBackendProducts } from "@/hooks/useBackendProducts";

export default function FeaturedProducts() {
  const { products, isLoading, error } = useBackendProducts();

  return (
    <section className="py-20 bg-cream">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-dark md:text-4xl">
              Featured Collections
            </h2>
            <p className="mt-2 text-slate-dark/70">
              Discover our most popular personalized products.
            </p>
          </div>
          <Link
            className="flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all"
            href="/shop"
          >
            View All Products
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {error && <p className="text-center text-slate-dark/60">{error}</p>}

        {!error && (
          <Carousel gap="gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-[0_0_80%] sm:flex-[0_0_48%] md:flex-[0_0_35%] lg:flex-[0_0_25%] min-w-0 flex flex-col gap-4 animate-pulse"
                  >
                    <div className="aspect-[4/5] w-full rounded-2xl bg-slate-dark/10" />
                    <div className="flex flex-col gap-2">
                      <div className="h-5 w-3/4 rounded bg-slate-dark/10" />
                      <div className="h-4 w-1/2 rounded bg-slate-dark/10" />
                    </div>
                  </div>
                ))
              : products.map((product) => (
                  <div
                    key={product.productRefId ?? product.shopifyHandle}
                    className="group flex-[0_0_80%] sm:flex-[0_0_48%] md:flex-[0_0_35%] lg:flex-[0_0_25%] min-w-0 flex flex-col gap-4"
                  >
                    <Link
                      href={`/product/${product.shopifyHandle}`}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div
                        className="aspect-[4/5] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('${product.img}')` }}
                      />
                    </Link>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-dark line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-base font-bold text-slate-dark">
                          {product.price}
                        </span>
                      </div>
                      <Link
                        href={`/product/${product.shopifyHandle}`}
                        className="mt-auto w-full text-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
                      >
                        See Details
                      </Link>
                    </div>
                  </div>
                ))}
          </Carousel>
        )}
      </Container>
    </section>
  );
}
