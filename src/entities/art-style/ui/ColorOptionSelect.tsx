"use client";

import { useEffect, useRef, useState } from "react";
import { SelectOptionItem } from "@/entities/art-style/model/styles";
import { getOptionColor } from "@/entities/art-style/lib/optionColors";

interface ColorOptionSelectProps {
  label: string;
  value: string;
  options: SelectOptionItem[];
  onChange: (value: string) => void;
}

/** El borde evita que los colores muy claros desaparezcan sobre el panel blanco. */
function ColorDot({ value }: { value: string }) {
  return (
    <span
      className="size-3.5 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: getOptionColor(value) ?? "#D1D5DB" }}
    />
  );
}

/**
 * Selector desplegable para opciones de color (fondo, líneas...): cada fila
 * muestra el color real a la izquierda, el nombre al lado y un check en la
 * seleccionada. Sigue el mismo patrón de apertura + click fuera + Escape que
 * PbnPostMenu y UserMenu.
 */
export default function ColorOptionSelect({
  label,
  value,
  options,
  onChange,
}: ColorOptionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
        {label}
      </span>

      <div className="relative" ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label}
          className="flex w-full items-center gap-3 rounded-xl border border-[#E0DED9] bg-white px-4 py-2.5 transition-all hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {/* El punto y el chevron ocupan el mismo ancho para que el nombre
              quede centrado respecto del botón, no del espacio sobrante. */}
          <span className="flex w-5 shrink-0 justify-start">
            {selected && <ColorDot value={selected.value} />}
          </span>
          <span className="min-w-0 flex-1 truncate text-center font-body text-base font-bold text-text-main">
            {selected?.label ?? "Select an option"}
          </span>
          <span
            className={`material-symbols-outlined w-5 shrink-0 text-[20px] text-text-muted transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#E0DED9] bg-white py-1 shadow-lg"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-base text-text-main transition-colors hover:bg-cream"
                >
                  <ColorDot value={option.value} />
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined shrink-0 text-[20px] text-primary">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
