"use client";

import { Badge, InlineStack, Select } from "@shopify/polaris";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_TONES as STATUS_TONES,
} from "@/entities/admin/lib/production-status";

type ItemFulfillmentControlProps = {
  value: "in_house" | "pod";
  disabled: boolean;
  onChange: (value: string) => void;
  productionStatus: string;
};

// Selector del método de fulfillment (taller / POD) junto al badge del estado
// de producción actual del item.
export function ItemFulfillmentControl({
  value,
  disabled,
  onChange,
  productionStatus,
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
        {PRODUCTION_STATUS_LABELS[productionStatus] ?? productionStatus}
      </Badge>
    </InlineStack>
  );
}
