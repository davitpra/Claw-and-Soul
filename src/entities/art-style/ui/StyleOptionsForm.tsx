"use client";

import { ChevronDown } from "lucide-react";
import { TemplateVarOption } from "@/entities/art-style/model/styles";

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
    <div className="flex flex-col gap-1">
      {entries.map(([key, opt]) => (
        <div
          key={key}
          className="flex items-center border border-primary/40 rounded-lg overflow-hidden"
        >
          <div className="bg-primary/10 px-4 py-3 min-w-24 border-r border-primary/40">
            <span className="font-bold text-primary uppercase tracking-widest">
              {opt.label}
            </span>
          </div>

          {opt.type === "select" && (
            <div className="relative flex-1">
              <select
                value={String(value[key] ?? opt.default)}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full appearance-none bg-white px-4 py-3 pr-10 font-medium text-text-main focus:outline-none cursor-pointer"
              >
                {opt.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            </div>
          )}

          {opt.type === "slider" && (
            <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3">
              <input
                type="range"
                min={opt.min}
                max={opt.max}
                step={opt.step ?? 1}
                value={Number(value[key] ?? opt.default)}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="font-bold text-primary w-8 text-right">
                {value[key] ?? opt.default}
              </span>
            </div>
          )}

          {opt.type === "color" && (
            <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3">
              <input
                type="color"
                value={String(value[key] ?? opt.default)}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-8 h-8 rounded-lg border border-primary/40 cursor-pointer p-0.5 bg-white"
              />
              <span className="font-medium text-text-main uppercase tracking-wider">
                {value[key] ?? opt.default}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
