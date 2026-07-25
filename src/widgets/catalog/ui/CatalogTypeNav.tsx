"use client";

import type { CatalogSectionGroup } from "../model/sections";

/** Id del <section> de cada tipo; lo comparten la barra y el render de secciones. */
export function catalogSectionId(key: string): string {
  return `catalog-section-${key}`;
}

interface CatalogTypeNavProps {
  sections: CatalogSectionGroup[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}

/**
 * Barra de chips para filtrar por product type. Cada chip es un toggle: al
 * elegirlo se muestran solo los productos de ese tipo, y al volver a pulsarlo
 * se vuelven a mostrar todas las secciones.
 */
export function CatalogTypeNav({ sections, selected, onSelect }: CatalogTypeNavProps) {
  return (
    <nav aria-label="Product types" className="overflow-x-auto rounded-xl bg-white p-1">
      <div className="flex flex-nowrap gap-1">
        {sections.map((section) => {
          const isActive = section.key === selected;
          return (
            <button
              key={section.key}
              onClick={() => onSelect(isActive ? null : section.key)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-cream"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
