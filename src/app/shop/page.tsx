"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import { ShopFilters, useShopFilters, useShopProducts } from "@/widgets/shop";

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const { products, loading, collections, styleCategories } =
    useShopProducts(searchQuery);
  const filters = useShopFilters(
    products,
    collections,
    styleCategories,
    searchQuery,
  );
  const { filteredProducts, activeFilterCount, clearFilters } = filters;

  // En móvil el sidebar vive detrás de un toggle "Filters".
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Scroll infinito: mostramos los productos de a tandas y cargamos más al
  // acercarnos al final de la grilla.
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Al cambiar el conjunto filtrado, volvemos a empezar desde la primera tanda
  // (reset durante render, el patrón recomendado por React para estado derivado).
  const [prevFiltered, setPrevFiltered] = useState(filteredProducts);
  if (filteredProducts !== prevFiltered) {
    setPrevFiltered(filteredProducts);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-cream">
      <Navbar />

      <main className="grow w-full px-4 md:px-10 py-10 md:py-16">
        <div className="container-site">
          {/* Hero Section */}
          <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
            {searchQuery ? (
              <>
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Search Results
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">
                  &ldquo;{searchQuery}&rdquo;
                </h1>
                <p className="text-secondary/70 text-lg leading-relaxed">
                  {loading
                    ? "Searching our collection..."
                    : `${products.length} ${products.length === 1 ? "result" : "results"} found.`}
                </p>
              </>
            ) : (
              <>
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Handcrafted for Happiness
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">
                  Our Soulful Collection
                </h1>
                <p className="text-secondary/70 text-lg leading-relaxed">
                  Discover personalized treasures designed to celebrate the
                  unconditional love of your furry companions.
                </p>
              </>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Filters rail (desktop) */}
              <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
                <ShopFilters filters={filters} />
              </aside>

              {/* Results */}
              <div className="flex-1 w-full min-w-0">
                {/* Toolbar: toggle móvil + conteo de resultados */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className="lg:hidden flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-slate-dark text-sm font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      tune
                    </span>
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <p className="text-sm text-text-muted ml-auto">
                    Showing{" "}
                    <span className="font-bold text-slate-dark">
                      {filteredProducts.length}
                    </span>{" "}
                    of {products.length}{" "}
                    {products.length === 1 ? "product" : "products"}
                  </p>
                </div>

                {/* Filters panel (mobile) */}
                {filtersOpen && (
                  <div className="lg:hidden mb-6">
                    <ShopFilters filters={filters} />
                  </div>
                )}

                {/* Product Grid */}
                {products.length === 0 ? (
                  <div className="text-center py-20">
                    {searchQuery ? (
                      <>
                        <p className="text-secondary/60 text-xl">
                          No products match &ldquo;{searchQuery}&rdquo;.
                        </p>
                        <p className="text-secondary/40 mt-2">
                          Try a different search term.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-secondary/60 text-xl">
                          No products found in your Shopify store.
                        </p>
                        <p className="text-secondary/40 mt-2">
                          Add some products in your Shopify Admin to see them
                          here.
                        </p>
                      </>
                    )}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-secondary/60 text-xl">
                      No products match your filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-primary font-bold hover:text-primary-dark transition-all text-sm uppercase tracking-widest"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.shopifyHandle}
                        product={product}
                        showPrice={true}
                        showBadge={false}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div
                    ref={sentinelRef}
                    className="mt-16 flex justify-center"
                    aria-hidden="true"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-cream">
          <Navbar />
          <main className="grow w-full flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </main>
          <Footer />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
