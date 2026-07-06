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
    <div className="rounded-xl bg-white p-6" ref={guideRef}>
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

      <div className="overflow-x-auto">
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
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.entries.map((e, j) => (
                        <Fragment key={j}>
                          {j > 0 && (
                            <span className="font-bold text-text-muted">+</span>
                          )}
                          <span className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5">
                            <span
                              className="size-4 shrink-0 rounded-full border border-black/10"
                              style={{
                                backgroundColor: `rgb(${e.paint.rgb[0]},${e.paint.rgb[1]},${e.paint.rgb[2]})`,
                              }}
                            />
                            <span className="flex flex-col leading-tight">
                              <span className="text-xs font-bold text-primary">
                                {e.parts} {e.parts === 1 ? "part" : "parts"}
                              </span>
                              <span className="text-xs text-slate-dark">
                                {e.paint.nameEn}
                              </span>
                            </span>
                          </span>
                        </Fragment>
                      ))}
                    </div>
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
