"use client";

export interface ChipOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface OptionChipsProps {
  /** Nombre del grupo de radios; debe ser único dentro de la página. */
  name: string;
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
  /**
   * Reparte los chips en una grilla de columnas iguales que ocupa todo el
   * ancho, en vez de dejarlos crecer según su texto.
   */
  fill?: boolean;
}

/** Máximo de chips por fila en modo `fill`; el resto baja a la fila siguiente. */
const MAX_FILL_COLUMNS = 4;

const chipClassName =
  "cursor-pointer rounded-xl border border-[#E0DED9] bg-white px-4 py-2.5 " +
  "font-body text-sm font-bold text-text-main transition-all " +
  "hover:border-primary/50 hover:shadow-md " +
  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white " +
  "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 " +
  "peer-disabled:cursor-not-allowed peer-disabled:opacity-40 peer-disabled:hover:border-[#E0DED9] peer-disabled:hover:shadow-none";

/**
 * Grupo de opciones como chips seleccionables. El input radio va oculto pero
 * sigue siendo el que recibe el foco y las flechas del teclado; el chip visible
 * reacciona con `peer-checked`.
 */
export default function OptionChips({
  name,
  label,
  value,
  options,
  onChange,
  fill = false,
}: OptionChipsProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const listClassName = fill ? "grid gap-2.5" : "flex flex-wrap gap-2.5";
  const listStyle = fill
    ? {
        gridTemplateColumns: `repeat(${Math.min(
          options.length,
          MAX_FILL_COLUMNS,
        )}, minmax(0, 1fr))`,
      }
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {label}
        </span>
        {selectedLabel && (
          <span className="font-body text-sm font-bold text-text-main">
            {selectedLabel}
          </span>
        )}
      </div>
      <div className={listClassName} style={listStyle}>
        {options.map((option) => (
          <label key={option.value} className={fill ? "block h-full" : "block"}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              aria-label={`${label}: ${option.label}`}
              className="peer sr-only"
            />
            <span
              className={
                fill
                  ? `${chipClassName} flex h-full w-full items-center justify-center text-center leading-tight`
                  : `${chipClassName} block`
              }
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
