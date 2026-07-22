"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_CATALOG_TYPE,
  CatalogFiltersModal,
  CatalogSection,
  CatalogTypeNav,
  groupIntoSections,
  catalogSectionId,
  useCatalogFilters,
  useCatalogProducts,
} from "@/widgets/catalog";
import type { CatalogProduct } from "@/widgets/catalog";
import { CircularCategory } from "@/widgets/circular-category";
import { Container } from "@/shared/ui/Container";

// Solo los productos con rol dedicado en el admin ("Producto Paint by Numbers" y
// "Producto Credit Pack") tienen su propia landing en vez de la página genérica
// /product/{handle}. El resto de los PBN por estilo mantienen su página normal.
function productHref(product: CatalogProduct): string | undefined {
  if (product.isPbnKit) return "/studio";
  if (product.isCreditPack) return "/credits";
  return undefined;
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  // Handle de colección: lo pone el grid de categorías del home o el carrusel.
  // Vive en la URL, no en estado local, porque decide qué se le pide a Shopify.
  const collectionHandle = searchParams.get("collection")?.trim() ?? "";

  const { products, loading, styleCategories } = useCatalogProducts(
    searchQuery,
    collectionHandle,
  );
  const filters = useCatalogFilters(
    products,
    styleCategories,
    searchQuery,
    collectionHandle,
  );
  const { filteredProducts, activeFilterCount, clearFilters } = filters;

  // Elegir categoría reemplaza la búsqueda: son dos formas de acotar el catálogo
  // y la Storefront API no permite combinarlas en una sola consulta.
  const selectCollection = (handle: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    if (handle) params.set("collection", handle);
    else params.delete("collection");
    const query = params.toString();
    router.replace(query ? `/catalog?${query}` : "/catalog", { scroll: false });
  };

  // Los filtros viven en un modal detrás del botón "Filters" en todos los
  // tamaños: no hay rail fijo en desktop.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Tipo elegido en la barra de chips; null muestra todas las secciones y
  // DEFAULT_CATALOG_TYPE es lo que se ve al entrar. La selección se guarda junto
  // con el contexto (búsqueda + colección) en que se hizo: si el contexto
  // cambia trae otro catálogo y se vuelve al tipo por defecto.
  const typeContext = `${searchQuery}|${collectionHandle}`;
  const [typeSelection, setTypeSelection] = useState<{
    context: string;
    type: string | null;
  }>({ context: typeContext, type: DEFAULT_CATALOG_TYPE });
  const selectedType =
    typeSelection.context === typeContext
      ? typeSelection.type
      : DEFAULT_CATALOG_TYPE;
  const selectType = (type: string | null) =>
    setTypeSelection({ context: typeContext, type });

  // Los productos filtrados se agrupan por tipo en secciones ordenadas
  // (PBN → Canvas → Poster → Accessories → Credits → Other). La barra siempre
  // recibe todas las secciones; el grid solo la del tipo elegido. Si los
  // filtros dejan sin productos al tipo elegido, se ignora la selección.
  const allSections = groupIntoSections(filteredProducts);
  const activeType = allSections.some((s) => s.key === selectedType)
    ? selectedType
    : null;
  const sections = activeType
    ? allSections.filter((s) => s.key === activeType)
    : allSections;

  // Contadores del "Showing X of Y". El total sigue al chip elegido: con un tipo
  // seleccionado cuenta los productos de ese tipo sin filtrar, para que se lea
  // contra lo que la barra tiene marcado y no contra todo el catálogo.
  const shownCount = sections.reduce((n, s) => n + s.products.length, 0);
  const totalCount = activeType
    ? (groupIntoSections(products).find((s) => s.key === activeType)?.products
        .length ?? products.length)
    : products.length;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-cream">
      <Navbar />

      <main className="grow w-full px-4 py-4">
        <Container>
          {/* Hero Section */}
          <div className="text-start mb-4">
            {searchQuery && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">
                  Results for{" "}
                  <span className="text-primary font-bold">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                </h1>
                <p className="text-secondary/70 text-lg leading-relaxed">
                  {loading
                    ? "Searching our collection..."
                    : `${products.length} ${products.length === 1 ? "result" : "results"} found.`}
                </p>
              </>
            )}
          </div>

          {/* Carrusel de categorías: tiene su propio fetch y skeleton, así que
              se muestra sin esperar a los productos. */}
          <div className="mb-8">
            <CircularCategory
              selected={collectionHandle}
              onSelect={selectCollection}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full min-w-0">
              {/* Toolbar filters. En mobile son dos filas (botón + contador
                  arriba, chips scrolleables abajo); en md+ una sola fila. */}
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex shrink-0 items-center gap-2 h-10 px-5 rounded-xl bg-white text-slate-dark text-sm font-bold shadow-sm hover:shadow-md transition-all"
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

                <p className="order-2 md:order-3 ml-auto shrink-0 text-sm text-text-muted">
                  Showing{" "}
                  <span className="font-bold text-slate-dark">{shownCount}</span>{" "}
                  of {totalCount} {totalCount === 1 ? "product" : "products"}
                </p>

                {/* Barra para filtrar los productos por product type.
                    min-w-0 permite que el overflow-x-auto del nav actúe. */}
                {allSections.length > 1 && (
                  <div className="order-3 md:order-2 w-full min-w-0 md:w-auto md:flex-1">
                    <CatalogTypeNav
                      sections={allSections}
                      selected={activeType}
                      onSelect={selectType}
                    />
                  </div>
                )}
              </div>

              <CatalogFiltersModal
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
              />

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
                  ) : collectionHandle ? (
                    <>
                      <p className="text-secondary/60 text-xl">
                        This collection has no products yet.
                      </p>
                      <button
                        onClick={() => selectCollection("")}
                        className="mt-4 text-primary font-bold hover:text-primary-dark transition-all text-sm uppercase tracking-widest"
                      >
                        Browse all products
                      </button>
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
                    <CatalogSection
                      key={section.key}
                      id={catalogSectionId(section.key)}
                      title={section.title}
                      products={section.products}
                      productHref={productHref}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
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
      <CatalogContent />
    </Suspense>
  );
}
