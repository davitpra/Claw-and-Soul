"use client";

import { Fragment, useState } from "react";
import { RGB } from "@/lib/pbn/common";
import { DEFAULT_BASE_PAINTS } from "@/lib/pbn/basePaints";
import type { BasePaint, MixRecipe } from "@/lib/pbn/paintMixing";

interface MixingGuideProps {
  recipes: MixRecipe[] | null;
  palette: RGB[];
  guideRef: React.RefObject<HTMLDivElement | null>;
}

function PaintChip({ entry }: { entry: MixRecipe["entries"][number] }) {
  const { paint, parts } = entry;
  return (
    <span className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5">
      <span
        className="size-4 shrink-0 rounded-full border border-black/10"
        style={{
          backgroundColor: `rgb(${paint.rgb[0]},${paint.rgb[1]},${paint.rgb[2]})`,
        }}
      />
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-primary">
          {parts} {parts === 1 ? "part" : "parts"}
        </span>
        <span className="text-xs text-slate-dark">{paint.nameShortEn}</span>
      </span>
    </span>
  );
}

function FormulaChips({
  entries,
  layout = "inline",
}: {
  entries: MixRecipe["entries"];
  layout?: "inline" | "grid";
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {entries.map((e, j) => (
          <PaintChip key={j} entry={e} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map((e, j) => (
        <Fragment key={j}>
          {j > 0 && <span className="font-bold text-text-muted">+</span>}
          <PaintChip entry={e} />
        </Fragment>
      ))}
    </div>
  );
}

export default function MixingGuide({
  recipes,
  palette,
  guideRef,
}: MixingGuideProps) {
  const [showBasePaints, setShowBasePaints] = useState(false);

  if (!recipes || palette.length === 0) return null;

  const usedPaints: BasePaint[] = [];
  const seen = new Set<string>();
  for (const recipe of recipes) {
    for (const e of recipe.entries) {
      if (!seen.has(e.paint.id)) {
        seen.add(e.paint.id);
        usedPaints.push(e.paint);
      }
    }
  }

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6" ref={guideRef}>
      <div className="mb-5">
        <p className="font-body text-sm text-text-muted">
          {recipes.length} colors and the formulas to create from this{" "}
          <button
            type="button"
            onClick={() => setShowBasePaints((v) => !v)}
            aria-expanded={showBasePaints}
            className="inline-flex items-center gap-0.5 font-bold text-primary transition-all hover:text-primary-dark"
          >
            list of base paints
            <span
              className={`material-symbols-outlined text-[18px] transition-all ${
                showBasePaints ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>
          .
        </p>
        {showBasePaints && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {(usedPaints.length > 0 ? usedPaints : DEFAULT_BASE_PAINTS).map(
              (p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span
                    className="size-7 shrink-0 rounded-md border border-black/10"
                    style={{
                      backgroundColor: `rgb(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]})`,
                    }}
                    title={`${p.nameEn} — nº ${p.codigo} (${p.pigmento}) — ${p.rgb[0]},${p.rgb[1]},${p.rgb[2]}`}
                  />
                  <span className="flex flex-col text-xs leading-tight text-slate-dark">
                    {p.nameEn}
                    <span className="text-text-muted">no. {p.codigo}</span>
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {recipes.map((recipe, i) => {
          const m = recipe.mixedRgb;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-[#E0DED9]"
            >
              <div className="flex items-center gap-3 border-b border-[#E0DED9] p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-bold text-slate-dark">
                  {i + 1}
                </span>
                <span
                  className="h-9 flex-1 rounded-md border border-black/10"
                  style={{
                    backgroundColor: `rgb(${m[0]},${m[1]},${m[2]})`,
                  }}
                  title={`Mix: ${m[0]},${m[1]},${m[2]}`}
                />
              </div>
              <div className="p-3">
                <FormulaChips entries={recipe.entries} layout="grid" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E0DED9] text-text-muted">
              <th className="w-10 py-2 font-semibold">#</th>
              <th className="w-24 py-2 font-semibold">Preview</th>
              <th className="py-2 font-semibold">
                Mixing formula
                <span className="ml-1 font-normal text-text-muted/70">
                  (sum of parts)
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe, i) => {
              const m = recipe.mixedRgb;
              return (
                <tr key={i} className="border-b border-[#E0DED9]/60">
                  <td className="py-3 font-bold text-slate-dark">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-9 rounded-md border border-black/10"
                        style={{
                          backgroundColor: `rgb(${m[0]},${m[1]},${m[2]})`,
                        }}
                        title={`Mix: ${m[0]},${m[1]},${m[2]}`}
                      />
                      <span className="text-text-muted">=</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <FormulaChips entries={recipe.entries} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
