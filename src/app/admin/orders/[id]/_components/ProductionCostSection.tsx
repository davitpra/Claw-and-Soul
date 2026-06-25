"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Text,
  InlineStack,
  BlockStack,
  TextField,
} from "@shopify/polaris";
import { adminApi, AdminOrderDetail } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";

type ProductionCostSectionProps = {
  order: AdminOrderDetail;
  orderId: string;
  onUpdate: () => void;
};

export function ProductionCostSection({
  order,
  orderId,
  onUpdate,
}: ProductionCostSectionProps) {
  const [productionCostInput, setProductionCostInput] = useState(
    order.productionCost?.toString() ?? "",
  );
  const [savingCost, setSavingCost] = useState(false);

  // Re-sync the field whenever a freshly saved cost arrives from the server.
  useEffect(() => {
    setProductionCostInput(order.productionCost?.toString() ?? "");
  }, [order.productionCost]);

  async function handleSaveCost() {
    setSavingCost(true);
    try {
      const parsed = productionCostInput.trim()
        ? parseFloat(productionCostInput)
        : null;
      await adminApi.orders.updateProductionCost(
        orderId,
        parsed != null && !isNaN(parsed) ? parsed : null,
      );
      onUpdate();
    } finally {
      setSavingCost(false);
    }
  }

  return (
    <BlockStack gap="200">
      <Text variant="bodySm" fontWeight="semibold" as="span">
        Costo de producción
      </Text>
      <InlineStack gap="200" blockAlign="center">
        <div style={{ flex: 1 }}>
          <TextField
            label="Costo de producción"
            labelHidden
            type="number"
            prefix={order.currency}
            value={productionCostInput}
            onChange={setProductionCostInput}
            autoComplete="off"
          />
        </div>
        <Button
          variant="primary"
          size="slim"
          loading={savingCost}
          disabled={
            productionCostInput === (order.productionCost?.toString() ?? "")
          }
          onClick={handleSaveCost}
        >
          Guardar
        </Button>
      </InlineStack>
      {productionCostInput !== "" &&
        !isNaN(parseFloat(productionCostInput)) &&
        (() => {
          const cost = parseFloat(productionCostInput);
          const margin = order.totalAmount - cost;
          const tone = margin >= 0 ? "success" : "critical";
          return (
            <InlineStack align="space-between">
              <Text variant="bodySm" tone="subdued" as="span">
                Margen estimado
              </Text>
              <Text
                variant="bodySm"
                tone={tone}
                fontWeight="semibold"
                as="span"
              >
                {fmtCurrency(margin, order.currency)}
              </Text>
            </InlineStack>
          );
        })()}
    </BlockStack>
  );
}
