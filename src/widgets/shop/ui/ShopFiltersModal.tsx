"use client";

import Modal from "@/shared/ui/Modal";
import { ShopFilters as ShopFiltersState } from "../model/useShopFilters";
import { ShopFilters } from "./ShopFilters";

// Modal de filtros del shop: el único acceso a los filtros en todos los
// breakpoints. No hay botón "Apply" porque cada checkbox ya reordena el grid al
// instante; el botón primario solo cierra y sirve de resumen del resultado.
export function ShopFiltersModal({
  open,
  onClose,
  filters,
}: {
  open: boolean;
  onClose: () => void;
  filters: ShopFiltersState;
}) {
  const { filteredProducts, activeFilterCount, clearFilters } = filters;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      maxWidth="max-w-2xl"
      label="Shop filters"
      footer={
        <div className="flex items-center justify-end gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mr-auto rounded-xl border border-[#E0DED9] bg-white px-4 py-2 text-sm font-bold text-text-main transition-all hover:bg-gray-50"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-dark"
          >
            Show {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </button>
        </div>
      }
    >
      <ShopFilters filters={filters} />
    </Modal>
  );
}
