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
}

const chipClassName =
  "block cursor-pointer rounded-xl border border-[#E0DED9] bg-white px-4 py-2.5 " +
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
}: OptionChipsProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label;

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
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <label key={option.value}>
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
            <span className={chipClassName}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
