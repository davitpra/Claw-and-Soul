"use client";

import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { useBackendProducts } from "@/hooks/useBackendProducts";

export default function FeaturedProducts() {
  const { products, isLoading, error } = useBackendProducts();

  return (
    <section className="py-20 bg-cream">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-dark md:text-4xl font-display">
              Featured Collections
            </h2>
            <p className="mt-2 text-slate-dark/60">
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
          <Carousel gap="gap-8">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
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
                ))
              : products.map((product) => (
                  <div
                    key={product.productRefId ?? product.shopifyHandle}
                    className="group flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0 flex flex-col gap-4"
                  >
                    <Link
                      href={`/product/${product.shopifyHandle}`}
                      className="relative overflow-hidden bg-white shadow-sm block"
                    >
                      <div
                        className="aspect-4/5 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('${product.img}')` }}
                      />
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
                        Featured
                      </span>
                    </Link>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-dark line-clamp-1 font-display">
                          {product.name}
                        </h3>
                        <span className="text-base font-bold text-slate-dark">
                          {product.price}
                        </span>
                      </div>
                      <Link
                        href={`/product/${product.shopifyHandle}`}
                        className="mt-1 w-full text-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark"
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
