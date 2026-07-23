import { DIFFICULTY_LABELS } from "@/entities/art-style/model/difficulty";
import { artKindLabel } from "@/entities/product/model/artKind";
import { PRICE_RANGES } from "../model/priceRanges";
import { CatalogFilters as CatalogFiltersState } from "../model/useCatalogFilters";
import { FilterGroup } from "./FilterGroup";
import { FilterOption } from "./FilterOption";

// Cuerpo del modal de filtros del catálogo (el título, el cierre y las acciones los
// pone CatalogFiltersModal). Los grupos fluyen en dos columnas desde `sm:` para
// acortar el scroll. La colección no vive aquí: la elige CircularCategory.
export function CatalogFilters({ filters }: { filters: CatalogFiltersState }) {
  const {
    productTypes,
    productTypeCounts,
    selectedProductTypes,
    toggleProductType,
    artKinds,
    artKindCounts,
    selectedArtKinds,
    toggleArtKind,
    styles,
    styleCounts,
    stylesByCategory,
    selectedStyles,
    toggleStyle,
    difficulties,
    difficultyCounts,
    selectedDifficulties,
    toggleDifficulty,
    priceRangeCounts,
    selectedPriceRanges,
    togglePriceRange,
    onSaleCount,
    onSaleOnly,
    toggleOnSaleOnly,
  } = filters;

  return (
    // pb-0: el margen inferior del último grupo ya hace de padding, y `last:`
    // no es fiable dentro de un contenedor multi-columna.
    <div className="columns-1 sm:columns-2 gap-8 px-6 pt-6 pb-0">
      {productTypes.length > 0 && (
        <FilterGroup title="Product Type">
          {productTypes.map((type) => (
            <FilterOption
              key={type}
              label={type}
              count={productTypeCounts.get(type) ?? 0}
              checked={selectedProductTypes.includes(type)}
              onChange={() => toggleProductType(type)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Contenido de la obra: coloreable para pintar vs arte terminado. */}
      {artKinds.length > 0 && (
        <FilterGroup title="Artwork Type">
          {artKinds.map((kind) => (
            <FilterOption
              key={kind}
              label={artKindLabel(kind) ?? kind}
              count={artKindCounts.get(kind) ?? 0}
              checked={selectedArtKinds.includes(kind)}
              onChange={() => toggleArtKind(kind)}
            />
          ))}
        </FilterGroup>
      )}

      {styles.length > 0 && (
        <FilterGroup title="Style">
          {stylesByCategory.map(({ category, styleNames }) => (
            <div key={category} className="mb-4 last:mb-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                {category}
              </p>
              {styleNames.map((style) => (
                <FilterOption
                  key={style}
                  label={style}
                  count={styleCounts.get(style) ?? 0}
                  checked={selectedStyles.includes(style)}
                  onChange={() => toggleStyle(style)}
                />
              ))}
            </div>
          ))}
        </FilterGroup>
      )}

      {difficulties.length > 0 && (
        <FilterGroup title="Difficulty">
          {difficulties.map((difficulty) => (
            <FilterOption
              key={difficulty}
              label={DIFFICULTY_LABELS[difficulty]}
              count={difficultyCounts.get(difficulty) ?? 0}
              checked={selectedDifficulties.includes(difficulty)}
              onChange={() => toggleDifficulty(difficulty)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        {PRICE_RANGES.map((range) => (
          <FilterOption
            key={range.id}
            label={range.label}
            count={priceRangeCounts.get(range.id) ?? 0}
            checked={selectedPriceRanges.includes(range.id)}
            onChange={() => togglePriceRange(range.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Offers">
        <FilterOption
          label="On sale"
          count={onSaleCount}
          checked={onSaleOnly}
          onChange={toggleOnSaleOnly}
        />
      </FilterGroup>
    </div>
  );
}
