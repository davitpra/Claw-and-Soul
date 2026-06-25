"use client";

import { Select } from "@shopify/polaris";
import { PRODUCTION_STATUS_LABELS } from "@/entities/admin/lib/production-status";

type ItemStatusSelectProps = {
  allowed: string[];
  disabled: boolean;
  onSelect: (value: string) => void;
};

// Selector para mover el item a uno de sus estados de producción permitidos.
export function ItemStatusSelect({
  allowed,
  disabled,
  onSelect,
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
            label: PRODUCTION_STATUS_LABELS[s] ?? s,
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
