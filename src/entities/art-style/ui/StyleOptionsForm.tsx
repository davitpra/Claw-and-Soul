"use client";

import { TemplateVarOption } from "@/entities/art-style/model/styles";
import OptionChips from "@/shared/ui/OptionChips";

interface StyleOptionsFormProps {
  options: Record<string, TemplateVarOption>;
  value: Record<string, string | number>;
  onChange: (key: string, val: string | number) => void;
}

export function StyleOptionsForm({
  options,
  value,
  onChange,
}: StyleOptionsFormProps) {
  const entries = Object.entries(options);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {entries.map(([key, opt]) =>
        opt.type === "select" ? (
          <OptionChips
            key={key}
            name={`style-${key}`}
            label={opt.label}
            value={String(value[key] ?? opt.default)}
            options={opt.options}
            onChange={(val) => onChange(key, val)}
          />
        ) : (
          <div key={key} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                {opt.label}
              </span>
              <span className="font-body text-sm font-bold text-text-main uppercase tracking-wider">
                {value[key] ?? opt.default}
              </span>
            </div>

            {opt.type === "slider" && (
              <div className="rounded-xl bg-white px-4 py-3">
                <input
                  type="range"
                  min={opt.min}
                  max={opt.max}
                  step={opt.step ?? 1}
                  value={Number(value[key] ?? opt.default)}
                  onChange={(e) => onChange(key, Number(e.target.value))}
                  aria-label={opt.label}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {opt.type === "color" && (
              <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                <input
                  type="color"
                  value={String(value[key] ?? opt.default)}
                  onChange={(e) => onChange(key, e.target.value)}
                  aria-label={opt.label}
                  className="h-8 w-8 cursor-pointer rounded-xl border border-[#E0DED9] bg-white p-0.5"
                />
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
