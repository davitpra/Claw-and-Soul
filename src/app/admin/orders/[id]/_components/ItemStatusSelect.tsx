"use client";

import { Select } from "@shopify/polaris";
import { productionStatusLabel } from "@/entities/admin/lib/production-status";
import { OrderItemKind } from "@/entities/admin/lib/order-item-kind";

type ItemStatusSelectProps = {
  allowed: string[];
  disabled: boolean;
  onSelect: (value: string) => void;
  // Los accesorios renombran algún estado (ej. draft → "Por preparar").
  kind?: OrderItemKind;
};

// Selector para mover el item a uno de sus estados de producción permitidos.
export function ItemStatusSelect({
  allowed,
  disabled,
  onSelect,
  kind = "art",
}: ItemStatusSelectProps) {
  return (
    <div style={{ maxWidth: 280 }}>
      <Select
        label="Cambiar estado"
        disabled={disabled}
        value=""
        options={[
          { label: "Selecciona un estado…", value: "" },
          ...allowed.map((s) => ({
            label: productionStatusLabel(s, kind),
            value: s,
          })),
        ]}
        onChange={(value) => {
          if (!value) return;
          onSelect(value);
        }}
      />
    </div>
  );
}
