"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATALOG_FORMATS,
  CATALOG_INTENTS,
  DEFAULT_CATALOG_FORMAT,
  DEFAULT_CATALOG_INTENT,
  CatalogFiltersModal,
  CatalogSection,
  CatalogTypeNav,
  groupIntoSections,
  catalogSectionId,
  productIntent,
  useCatalogFilters,
  useCatalogProducts,
} from "@/widgets/catalog";
import type { CatalogProduct } from "@/widgets/catalog";
import { CircularCategory } from "@/widgets/circular-category";
import { Container } from "@/shared/ui/Container";

// Valor de `?intent=` / `?format=` que significa "sin acotar". Hace falta un
// sentinel porque el param ausente ya significa otra cosa: los valores por
// defecto de la barra.
const ALL_CHIPS = "all";

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

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.replace(query ? `/catalog?${query}` : "/catalog", { scroll: false });
  };

  // Elegir categoría reemplaza la búsqueda: son dos formas de acotar el catálogo
  // y la Storefront API no permite combinarlas en una sola consulta. Traer otro
  // catálogo también devuelve la barra de chips a sus valores por defecto: lo
  // que estuviera marcado puede no existir en el nuevo contexto.
  const selectCollection = (handle: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.delete("intent");
    params.delete("format");
    if (handle) params.set("collection", handle);
    else params.delete("collection");
    pushParams(params);
  };

  // Los filtros viven en un modal detrás del botón "Filters" en todos los
  // tamaños: no hay rail fijo en desktop.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Selección de la barra de chips: familia (fila 1) y formato (fila 2), ambas
  // null cuando no acotan nada. Vive en la URL para que el catálogo sea
  // enlazable (el footer entra directo a "Canvas Prints", "Accessories"…) y
  // sobreviva a un refresh. Param ausente → valor por defecto; el sentinel
  // "all" es el "sin filtro" que antes representaba el estado null.
  const readChip = (key: string, fallback: string) => {
    const value = searchParams.get(key);
    if (value === null) return fallback;
    return value === ALL_CHIPS ? null : value;
  };
  const current = {
    intent: readChip("intent", DEFAULT_CATALOG_INTENT),
    format: readChip("format", DEFAULT_CATALOG_FORMAT),
  };
  const selectChip = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value ?? ALL_CHIPS);
    pushParams(params);
  };
  // Cambiar de familia no resetea el formato: si el nuevo contexto no lo ofrece,
  // `activeFormat` lo ignora por su cuenta y el chip vuelve al elegir una familia
  // que sí lo tenga.
  const selectIntent = (intent: string | null) => selectChip("intent", intent);
  const selectFormat = (format: string | null) => selectChip("format", format);

  // Familias con productos tras los filtros del modal. Si la elegida se queda
  // vacía se ignora la selección y se muestra el catálogo completo, en vez de
  // dejar la pantalla en blanco.
  const intents = CATALOG_INTENTS.filter((intent) =>
    filteredProducts.some((p) => productIntent(p) === intent.key),
  );
  const activeIntent = intents.some((i) => i.key === current.intent)
    ? current.intent
    : null;
  const intentProducts = activeIntent
    ? filteredProducts.filter((p) => productIntent(p) === activeIntent)
    : filteredProducts;

  // Formatos con productos dentro de la familia activa. Las familias sin soporte
  // físico (Accessories, Credits) dejan la lista vacía y la fila se colapsa.
  const formats = CATALOG_FORMATS.map((format) => ({
    key: format.key,
    label: format.short,
    count: intentProducts.filter((p) => p.productType === format.key).length,
  })).filter((format) => format.count > 0);
  const activeFormat = formats.some((f) => f.key === current.format)
    ? current.format
    : null;

  // Los productos de la familia activa se agrupan por formato en secciones
  // ordenadas (Canvas → Poster → Digital → Accessories → Credits → Other); con un
  // formato elegido queda una sola.
  const allSections = groupIntoSections(intentProducts);
  const sections = activeFormat
    ? allSections.filter((s) => s.key === activeFormat)
    : allSections;

  // Contadores del "Showing X of Y". El total sigue a los chips: cuenta los
  // productos que casan con la familia y el formato marcados sin aplicar los
  // filtros del modal, para que se lea contra lo que la barra tiene marcado.
  const shownCount = sections.reduce((n, s) => n + s.products.length, 0);
  const totalCount = products.filter(
    (p) =>
      (!activeIntent || productIntent(p) === activeIntent) &&
      (!activeFormat || p.productType === activeFormat),
  ).length;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-white">
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
              {/* Toolbar: la barra de familia + formato lleva dentro el botón de
                  Filters, y el contador de resultados va debajo. */}
              <div className="mb-6">
                <CatalogTypeNav
                  intents={[...intents]}
                  selectedIntent={activeIntent}
                  onSelectIntent={selectIntent}
                  formats={formats}
                  selectedFormat={activeFormat}
                  onSelectFormat={selectFormat}
                  leading={
                    <button
                      onClick={() => setFiltersOpen(true)}
                      className="flex shrink-0 items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark hover:shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        tune
                      </span>
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-white text-primary text-[10px] font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  }
                />

                <p className="mt-3 text-end text-sm text-text-muted">
                  Showing{" "}
                  <span className="font-bold text-slate-dark">
                    {shownCount}
                  </span>{" "}
                  of {totalCount} {totalCount === 1 ? "product" : "products"}
                </p>
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
