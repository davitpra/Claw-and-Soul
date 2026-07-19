"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShopFilters,
  ShopSection,
  groupIntoSections,
  useShopFilters,
  useShopProducts,
} from "@/widgets/shop";
import type { ShopProduct } from "@/widgets/shop";

// Solo los productos con rol dedicado en el admin ("Producto Paint by Numbers" y
// "Producto Credit Pack") tienen su propia landing en vez de la página genérica
// /product/{handle}. El resto de los PBN por estilo mantienen su página normal.
function productHref(product: ShopProduct): string | undefined {
  if (product.isPbnKit) return "/paint-by-numbers";
  if (product.isCreditPack) return "/credits";
  return undefined;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  // Título de colección que llega del grid de categorías del home.
  const collectionQuery = searchParams.get("collection")?.trim() ?? "";

  const { products, loading, collections, styleCategories } =
    useShopProducts(searchQuery);
  const filters = useShopFilters(
    products,
    collections,
    styleCategories,
    searchQuery,
    collectionQuery,
  );
  const { filteredProducts, activeFilterCount, clearFilters } = filters;

  // En móvil el sidebar vive detrás de un toggle "Filters".
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Los productos filtrados se agrupan por tipo en secciones ordenadas
  // (PBN → Canvas → Poster → Accessories → Credits → Other).
  const sections = groupIntoSections(filteredProducts);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-cream">
      <Navbar />

      <main className="grow w-full px-4 md:px-10 py-4">
        <div className="container-site">
          {/* Hero Section */}
          <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
            {searchQuery && (
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
            )}
            {!searchQuery && collectionQuery && (
              <>
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Collection
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">
                  {collectionQuery}
                </h1>
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
                  <div>
                    {sections.map((section) => (
                      <ShopSection
                        key={section.key}
                        title={section.title}
                        products={section.products}
                        productHref={productHref}
                      />
                    ))}
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
