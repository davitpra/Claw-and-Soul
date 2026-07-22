"use client";

import { useRef, useState } from "react";
import type { SizeOption } from "@/entities/product/lib/sizeOptions";

interface ProductSizeSelectorProps {
  /** Nombre de la opción tal como viene de Shopify (ej. `Size`). */
  label: string;
  options: SizeOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Lado mayor de la vista previa, en px. El resto escala proporcionalmente. */
const PREVIEW_MAX = 76;

/**
 * Selecciona el tamaño del cuadro como un rodillo: el valor gira al cambiar y
 * la vista previa se redimensiona a la proporción real del formato. Los puntos
 * inferiores son el `radiogroup` accesible; los chevrones sólo son atajos.
 */
export default function ProductSizeSelector({
  label,
  options,
  value,
  onChange,
}: ProductSizeSelectorProps) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const index = selectedIndex === -1 ? 0 : selectedIndex;

  // `key` reinicia la animación en cada cambio y `dir` elige el sentido del
  // giro. Los chevrones lo fijan explícitamente (así el salto del último al
  // primero sigue girando hacia arriba); cualquier cambio externo —otra
  // variante, autoselección— se reconcilia comparando índices.
  const [spin, setSpin] = useState({ index, key: 0, dir: 1 as 1 | -1 });

  if (spin.index !== index) {
    setSpin({ index, key: spin.key + 1, dir: index > spin.index ? 1 : -1 });
  }

  const goTo = (next: number, dir: 1 | -1) => {
    setSpin({ index: next, key: spin.key + 1, dir });
    onChange(options[next].value);
  };

  const move = (delta: 1 | -1) => {
    if (options.length < 2) return -1;
    const next = (index + delta + options.length) % options.length;
    goTo(next, delta);
    return next;
  };

  // Con roving tabindex el foco tiene que seguir al radio marcado; si no, se
  // queda en el punto anterior, que acaba de perder su `tabIndex={0}`.
  const groupRef = useRef<HTMLDivElement>(null);
  const moveWithFocus = (delta: 1 | -1) => {
    const next = move(delta);
    if (next >= 0) {
      (groupRef.current?.children[next] as HTMLElement | undefined)?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      moveWithFocus(1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      moveWithFocus(-1);
    }
  };

  if (options.length === 0) return null;

  const current = options[index];
  const isSingle = options.length === 1;

  // La talla más grande llena la caja; las demás quedan proporcionalmente
  // menores, así el salto entre formatos se ve además de leerse.
  const maxSide = Math.max(
    ...options.flatMap((o) => (o.width && o.height ? [o.width, o.height] : [])),
    1,
  );
  const { width, height } = current;
  const previewW = width && height ? (width / maxSide) * PREVIEW_MAX : 60;
  const previewH = width && height ? (height / maxSide) * PREVIEW_MAX : 60;

  const chevronClassName =
    "flex h-8 w-9 items-center justify-center rounded-xl border border-[#E0DED9] " +
    "bg-white text-text-main transition-all hover:bg-gray-50 hover:shadow-md " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 " +
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:shadow-none";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {label}
        </span>
        <span className="font-body text-sm font-bold text-text-main">
          {current.label}
        </span>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-white p-4">
        {/* Vista previa proporcional */}
        <div
          aria-hidden
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-cream"
        >
          <div
            className="rounded-sm bg-primary shadow-sm transition-all duration-500 motion-reduce:transition-none"
            style={{ width: previewW, height: previewH }}
          />
        </div>

        {/* Valor giratorio */}
        <div className="min-w-0 flex-1 perspective-normal">
          <div
            key={spin.key}
            className={
              spin.dir === 1
                ? "animate-size-spin-up motion-reduce:animate-none"
                : "animate-size-spin-down motion-reduce:animate-none"
            }
          >
            <p className="font-display text-2xl font-black leading-tight text-text-main">
              {current.label}
            </p>
            {current.disabled && (
              <p className="font-body text-sm font-bold text-text-muted">
                Sold out
              </p>
            )}
          </div>
        </div>

        {/* Atajos: los puntos de abajo son el control accesible real */}
        {!isSingle && (
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={`Next ${label.toLowerCase()}`}
              className={chevronClassName}
            >
              <span className="material-symbols-outlined text-[20px]">
                keyboard_arrow_up
              </span>
            </button>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={`Previous ${label.toLowerCase()}`}
              className={chevronClassName}
            >
              <span className="material-symbols-outlined text-[20px]">
                keyboard_arrow_down
              </span>
            </button>
          </div>
        )}
      </div>

      {!isSingle && (
        <div
          ref={groupRef}
          role="radiogroup"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="flex justify-center gap-1.5"
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={option.label}
              tabIndex={i === index ? 0 : -1}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className={
                "h-2 rounded-full transition-all focus-visible:outline-none " +
                "focus-visible:ring-2 focus-visible:ring-primary/30 " +
                (i === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-[#E0DED9] hover:bg-primary/40")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
