import { DIFFICULTY_LABELS } from "@/entities/art-style/model/difficulty";
import { PRICE_RANGES } from "../model/priceRanges";
import { CatalogFilters as CatalogFiltersState } from "../model/useCatalogFilters";
import { FilterGroup } from "./FilterGroup";
import { FilterOption } from "./FilterOption";

// Cuerpo del modal de filtros del catálogo (el título, el cierre y las acciones los
// pone CatalogFiltersModal). Los grupos fluyen en dos columnas desde `sm:` para
// acortar el scroll. Tres ejes no viven aquí: la colección la elige
// CircularCategory, y la familia y el formato son las dos filas de CatalogTypeNav.
export function CatalogFilters({ filters }: { filters: CatalogFiltersState }) {
  const {
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
