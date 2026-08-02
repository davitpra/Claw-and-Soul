"use client";

import { Badge, InlineStack, Select } from "@shopify/polaris";
import {
  productionStatusLabel,
  PRODUCTION_STATUS_TONES as STATUS_TONES,
} from "@/entities/admin/lib/production-status";
import { OrderItemKind } from "@/entities/admin/lib/order-item-kind";

type ItemFulfillmentControlProps = {
  value: "in_house" | "pod";
  disabled: boolean;
  onChange: (value: string) => void;
  productionStatus: string;
  // Los accesorios renombran algún estado (ej. draft → "Por preparar").
  kind?: OrderItemKind;
};

// Selector del método de fulfillment (taller / POD) junto al badge del estado
// de producción actual del item.
export function ItemFulfillmentControl({
  value,
  disabled,
  onChange,
  productionStatus,
  kind = "art",
}: ItemFulfillmentControlProps) {
  return (
    <InlineStack gap="200" blockAlign="center">
      <div style={{ minWidth: 180 }}>
        <Select
          label=""
          labelHidden
          options={[
            { label: "Taller (in-house)", value: "in_house" },
            { label: "POD (proveedor externo)", value: "pod" },
          ]}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <Badge tone={STATUS_TONES[productionStatus] ?? "enabled"}>
        {productionStatusLabel(productionStatus, kind)}
      </Badge>
    </InlineStack>
  );
}
