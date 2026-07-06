"use client";

import { ReactNode } from "react";

/** Small "?" badge that reveals a definition on hover or keyboard focus. */
export function HelpTip({ text }: { text: string }) {
  return (
    <span
      className="group relative inline-flex size-4 cursor-help items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
      tabIndex={0}
      role="note"
      aria-label={text}
    >
      ?
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-52 -translate-x-1/2 rounded-lg bg-slate-dark px-3 py-2 text-[11px] font-normal normal-case leading-snug tracking-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/** Teal switch toggle matching the Claw & Soul style. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-3">
      <span className="relative inline-block">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="block h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="text-sm font-medium text-slate-dark">{label}</span>
    </label>
  );
}

/** Segmented radio group (e.g. RGB/HSL/Lab). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-primary/40"
      role="radiogroup"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={o.label}
            className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-colors w-full text-center ${
              active
                ? "bg-primary text-white"
                : "bg-white text-slate-dark hover:bg-primary/5"
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={active}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
