"use client";

export interface PurchaseSizeOption {
  /** Clave de selección: el id de variante, o el valor de la talla. */
  value: string;
  label: string;
  /** Precio ya formateado de esa talla; se omite si no aplica. */
  price?: string;
  disabled?: boolean;
}

interface PurchaseSizePickerProps {
  /** Eyebrow sobre el selector, ej. "Choose a size". */
  label: string;
  /** Nombre accesible del grupo, ej. "Canvas size". */
  ariaLabel: string;
  options: PurchaseSizeOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Selector de talla de las cards de compra (kit PBN y producto de origen).
 * Responde al ancho de la card, no al del viewport: en una card ancha es un
 * `select` compacto y en la columna estrecha del detalle de la obra son fichas
 * pulsables con su precio. Las variantes `@2xl:` se resuelven contra el
 * `@container` de la card que lo envuelve.
 */
export function PurchaseSizePicker({
  label,
  ariaLabel,
  options,
  value,
  onChange,
}: PurchaseSizePickerProps) {
  if (options.length === 0) return null;

  return (
    <>
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </p>

      {/* Card ancha: select nativo compacto. */}
      <div className="relative mb-5 hidden @2xl:block">
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border-[1.5px] border-[#E0DED9] bg-white py-2.5 pl-3.5 pr-10 text-sm font-semibold text-slate-dark transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-text-muted">
          expand_more
        </span>
      </div>

      {/* Card estrecha: fichas pulsables. */}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="mb-5 grid gap-2 @2xl:hidden"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={`flex w-full items-center justify-between rounded-xl border-[1.5px] px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-[#E0DED9] bg-white hover:border-primary/40 disabled:hover:border-[#E0DED9]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid size-4.5 shrink-0 place-items-center rounded-full border-[1.5px] ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-black/20"
                  }`}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 13l4.5 4.5L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-dark">
                  {option.label}
                </span>
              </span>
              {option.price && (
                <span className="text-sm font-bold text-slate-dark">
                  {option.price}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
