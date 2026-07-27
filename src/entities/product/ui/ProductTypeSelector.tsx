"use client";

import Accordion from "@/shared/ui/Accordion";
import OptionChips, { type ChipOption } from "@/shared/ui/OptionChips";
import { getTypeInfo } from "@/entities/product/lib/typeInfo";

interface ProductTypeSelectorProps {
  /** Nombre de la opción tal como viene de Shopify (ej. `Type`). */
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function ProductTypeSelector({
  label,
  options,
  value,
  onChange,
}: ProductTypeSelectorProps) {
  if (options.length === 0) return null;

  // Un valor nuevo creado desde Shopify simplemente no lleva copy, en vez de
  // romper la ficha.
  const info = getTypeInfo(value);

  return (
    <div className="flex flex-col gap-3">
      <OptionChips
        name="type-option"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        fill
      />

      {info && (
        <div className="flex flex-wrap justify-between mt-2">
          <p className="font-body text-sm text-text-muted leading-relaxed">
            {info.short}
          </p>
          <Accordion
            title={`About ${value}`}
            summaryClassName="py-1"
            titleClassName="font-body text-sm font-bold  text-text-muted"
            iconClassName="text-[20px] text-text-muted"
            contentClassName="pt-2 font-body text-sm text-text-muted leading-relaxed"
          >
            {info.long}
          </Accordion>
        </div>
      )}
    </div>
  );
}
