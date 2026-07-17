import { DIFFICULTY_LABELS } from "@/entities/art-style/model/difficulty";
import { PRICE_RANGES } from "../model/priceRanges";
import { ShopFilters as ShopFiltersState } from "../model/useShopFilters";
import { FilterGroup } from "./FilterGroup";
import { FilterOption } from "./FilterOption";

// Sidebar de filtros del shop, compartido entre el rail de desktop y el panel móvil.
export function ShopFilters({ filters }: { filters: ShopFiltersState }) {
  const {
    collections,
    collectionCounts,
    selectedCollections,
    toggleCollection,
    productTypes,
    productTypeCounts,
    selectedProductTypes,
    toggleProductType,
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
    activeFilterCount,
    clearFilters,
  } = filters;

  return (
    <div className="flex flex-col gap-8 bg-white rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-slate-dark text-lg">
          Filters
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-primary hover:text-primary-dark transition-all uppercase tracking-wider"
          >
            Clear all
          </button>
        )}
      </div>

      {collections.length > 0 && (
        <FilterGroup title="Collection">
          {collections.map((collection) => (
            <FilterOption
              key={collection}
              label={collection}
              count={collectionCounts.get(collection) ?? 0}
              checked={selectedCollections.includes(collection)}
              onChange={() => toggleCollection(collection)}
            />
          ))}
        </FilterGroup>
      )}

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
