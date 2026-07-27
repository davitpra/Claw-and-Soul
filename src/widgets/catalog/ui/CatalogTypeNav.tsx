"use client";

import type { ReactNode } from "react";

/** Id del <section> de cada tipo; lo comparten la barra y el render de secciones. */
export function catalogSectionId(key: string): string {
  return `catalog-section-${key}`;
}

export interface CatalogFormatChip {
  key: string;
  label: string;
  count: number;
}

interface CatalogTypeNavProps {
  /** Familias de producto disponibles; el chip "All" lo pone la barra. */
  intents: { key: string; title: string }[];
  /** null = "All": no se filtra por familia. */
  selectedIntent: string | null;
  onSelectIntent: (key: string | null) => void;
  /** Formatos con productos dentro de la familia activa. Vacío colapsa la fila. */
  formats: CatalogFormatChip[];
  selectedFormat: string | null;
  onSelectFormat: (key: string | null) => void;
  /** Se ancla al inicio de la primera fila, fuera del scroll (botón Filters). */
  leading?: ReactNode;
}

const intentChipClassName =
  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all";

const formatChipClassName =
  "shrink-0 flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all";

/**
 * Barra de navegación del catálogo en dos ejes. La primera fila elige la familia
 * de producto (qué se compra) y la segunda el formato de entrega (en qué soporte
 * llega), acotado a lo que la familia activa ofrece.
 *
 * La familia se comporta como un radio: "All" es la opción de "sin filtro", así
 * que volver a pulsar el chip activo no lo apaga. El formato sí es un toggle:
 * apagarlo devuelve todas las secciones de esa familia.
 */
export function CatalogTypeNav({
  intents,
  selectedIntent,
  onSelectIntent,
  formats,
  selectedFormat,
  onSelectFormat,
  leading,
}: CatalogTypeNavProps) {
  return (
    <div className="rounded-2xl border border-[#E0DED9] bg-white p-2">
      {/* min-w-0 en el contenedor scrolleable para que el overflow actúe sin
          empujar al elemento fijo de la izquierda. */}
      <div className="flex items-center gap-2">
        {leading && <div className="shrink-0">{leading}</div>}

        <nav
          aria-label="Product families"
          className="min-w-0 flex-1 overflow-x-auto"
        >
          <div className="flex flex-nowrap gap-1">
            <button
              onClick={() => onSelectIntent(null)}
              aria-pressed={selectedIntent === null}
              className={`${intentChipClassName} ${
                selectedIntent === null
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-cream"
              }`}
            >
              All
            </button>

            {intents.map((intent) => {
              const isActive = intent.key === selectedIntent;
              return (
                <button
                  key={intent.key}
                  onClick={() => onSelectIntent(intent.key)}
                  aria-pressed={isActive}
                  className={`${intentChipClassName} ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:bg-cream"
                  }`}
                >
                  {intent.title}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {formats.length > 0 && (
        <div className="mt-2 flex items-center gap-3 border-t border-[#E0DED9] px-2 pt-2">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-text-muted">
            Format
          </span>

          <nav aria-label="Formats" className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex flex-nowrap gap-2 py-1">
              {formats.map((format) => {
                const isActive = format.key === selectedFormat;
                return (
                  <button
                    key={format.key}
                    onClick={() => onSelectFormat(isActive ? null : format.key)}
                    aria-pressed={isActive}
                    className={`${formatChipClassName} ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[#E0DED9] bg-white text-slate-dark hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    {format.label}
                    <span className="text-xs font-normal opacity-70">
                      {format.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
