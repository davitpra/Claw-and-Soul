/**
 * Clases Tailwind compartidas por los paneles del generador Paint by Numbers.
 * Centralizadas para mantener el estilo de Claw & Soul consistente (teal
 * #448da6 / cream, rounded-xl, Epilogue/Lato) entre todos los sub-componentes.
 */

export const card =
  "rounded-xl border border-[#E0DED9] bg-white p-6 shadow-sm";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-5 py-2.5 text-sm font-semibold text-slate-dark shadow-sm transition-all hover:bg-gray-50 hover:shadow-md";

export const fieldInput =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-dark transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

export const fieldLabel =
  "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted";

export const stepTitle =
  "flex items-center gap-3 font-display text-lg font-black text-slate-dark";

export const stepNum =
  "flex size-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary";
