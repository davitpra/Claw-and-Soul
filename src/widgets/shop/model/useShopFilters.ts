import { useMemo, useState } from "react";
import { StyleDifficulty } from "@/entities/art-style/model/difficulty";
import { DIFFICULTY_ORDER, PRICE_RANGES, inPriceRange } from "./priceRanges";
import { ShopProduct } from "./types";

const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Cuenta cuántos productos hay por cada valor de `key` (ignora los vacíos).
function countBy(products: ShopProduct[], key: keyof ShopProduct) {
  const counts = new Map<string, number>();
  for (const p of products) {
    const value = p[key];
    if (!value || typeof value !== "string") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export interface ShopFilters {
  products: ShopProduct[];
  filteredProducts: ShopProduct[];
  styleCategories: Map<string, string>;
  collections: string[];
  collectionCounts: Map<string, number>;
  selectedCollections: string[];
  toggleCollection: (value: string) => void;
  productTypes: string[];
  productTypeCounts: Map<string, number>;
  selectedProductTypes: string[];
  toggleProductType: (value: string) => void;
  styles: string[];
  styleCounts: Map<string, number>;
  stylesByCategory: { category: string; styleNames: string[] }[];
  selectedStyles: string[];
  toggleStyle: (value: string) => void;
  difficulties: StyleDifficulty[];
  difficultyCounts: Map<string, number>;
  selectedDifficulties: string[];
  toggleDifficulty: (value: string) => void;
  priceRangeCounts: Map<string, number>;
  selectedPriceRanges: string[];
  togglePriceRange: (value: string) => void;
  onSaleCount: number;
  onSaleOnly: boolean;
  toggleOnSaleOnly: () => void;
  activeFilterCount: number;
  clearFilters: () => void;
}

/**
 * Estado y derivaciones de los filtros del sidebar del shop. Cada grupo hace
 * OR interno; entre grupos se hace AND. Las selecciones se reinician cuando
 * cambia la búsqueda.
 *
 * `initialCollection` es el título de colección que llega por `?collection=`
 * (p. ej. desde el grid de categorías del home) y preselecciona ese filtro.
 */
export function useShopFilters(
  products: ShopProduct[],
  collections: string[],
  styleCategories: Map<string, string>,
  searchQuery: string,
  initialCollection: string = "",
): ShopFilters {
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialCollection ? [initialCollection] : [],
  );
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(
    [],
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    [],
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const clearFilters = () => {
    setSelectedCollections([]);
    setSelectedProductTypes([]);
    setSelectedStyles([]);
    setSelectedDifficulties([]);
    setSelectedPriceRanges([]);
    setOnSaleOnly(false);
  };

  // Al cambiar la búsqueda se reinician todos los filtros (reset durante render,
  // el patrón recomendado por React para estado derivado de una prop).
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    clearFilters();
  }

  // Igual que arriba, pero para `?collection=`: navegar de una categoría a otra
  // reemplaza la selección en vez de acumularla.
  const [prevInitialCollection, setPrevInitialCollection] =
    useState(initialCollection);
  if (initialCollection !== prevInitialCollection) {
    setPrevInitialCollection(initialCollection);
    setSelectedCollections(initialCollection ? [initialCollection] : []);
  }

  const collectionCounts = useMemo(
    () => countBy(products, "collection"),
    [products],
  );

  const productTypeCounts = useMemo(
    () => countBy(products, "productType"),
    [products],
  );
  const productTypes = useMemo(
    () => Array.from(productTypeCounts.keys()),
    [productTypeCounts],
  );

  const styleCounts = useMemo(() => countBy(products, "style"), [products]);
  const styles = useMemo(() => Array.from(styleCounts.keys()), [styleCounts]);

  // Estilos agrupados por su categoría (los sin categoría caen en "Other").
  const stylesByCategory = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const style of styles) {
      const category = styleCategories.get(style) || "Other";
      const group = groups.get(category) ?? [];
      group.push(style);
      groups.set(category, group);
    }
    return Array.from(groups.entries()).map(([category, styleNames]) => ({
      category,
      styleNames,
    }));
  }, [styles, styleCategories]);

  // La dificultad solo tiene sentido en los kits PBN, así que los conteos y las
  // opciones disponibles se calculan únicamente sobre esos productos.
  const difficultyCounts = useMemo(
    () => countBy(products.filter((p) => p.isPaintByNumbers), "difficulty"),
    [products],
  );
  const difficulties = useMemo(
    () => DIFFICULTY_ORDER.filter((d) => difficultyCounts.has(d)),
    [difficultyCounts],
  );

  const priceRangeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const range of PRICE_RANGES) {
      counts.set(
        range.id,
        products.filter((p) => inPriceRange(p.priceAmount, range.id)).length,
      );
    }
    return counts;
  }, [products]);

  const onSaleCount = useMemo(
    () => products.filter((p) => p.onSale).length,
    [products],
  );

  // AND entre grupos, OR dentro de cada grupo.
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (
          selectedCollections.length > 0 &&
          !selectedCollections.includes(p.collection)
        ) {
          return false;
        }
        if (
          selectedProductTypes.length > 0 &&
          !selectedProductTypes.includes(p.productType)
        ) {
          return false;
        }
        if (selectedStyles.length > 0 && !selectedStyles.includes(p.style)) {
          return false;
        }
        // Filtrar por dificultad restringe a PBN: es el único tipo donde aplica.
        if (
          selectedDifficulties.length > 0 &&
          (!p.isPaintByNumbers || !selectedDifficulties.includes(p.difficulty))
        ) {
          return false;
        }
        if (
          selectedPriceRanges.length > 0 &&
          !selectedPriceRanges.some((id) => inPriceRange(p.priceAmount, id))
        ) {
          return false;
        }
        if (onSaleOnly && !p.onSale) return false;
        return true;
      }),
    [
      products,
      selectedCollections,
      selectedProductTypes,
      selectedStyles,
      selectedDifficulties,
      selectedPriceRanges,
      onSaleOnly,
    ],
  );

  const activeFilterCount =
    selectedCollections.length +
    selectedProductTypes.length +
    selectedStyles.length +
    selectedDifficulties.length +
    selectedPriceRanges.length +
    (onSaleOnly ? 1 : 0);

  return {
    products,
    filteredProducts,
    styleCategories,
    collections,
    collectionCounts,
    selectedCollections,
    toggleCollection: (value) =>
      setSelectedCollections((prev) => toggleIn(prev, value)),
    productTypes,
    productTypeCounts,
    selectedProductTypes,
    toggleProductType: (value) =>
      setSelectedProductTypes((prev) => toggleIn(prev, value)),
    styles,
    styleCounts,
    stylesByCategory,
    selectedStyles,
    toggleStyle: (value) => setSelectedStyles((prev) => toggleIn(prev, value)),
    difficulties,
    difficultyCounts,
    selectedDifficulties,
    toggleDifficulty: (value) =>
      setSelectedDifficulties((prev) => toggleIn(prev, value)),
    priceRangeCounts,
    selectedPriceRanges,
    togglePriceRange: (value) =>
      setSelectedPriceRanges((prev) => toggleIn(prev, value)),
    onSaleCount,
    onSaleOnly,
    toggleOnSaleOnly: () => setOnSaleOnly((prev) => !prev),
    activeFilterCount,
    clearFilters,
  };
}
