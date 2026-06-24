"use client";

import {
  Card,
  Badge,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  DescriptionList,
} from "@shopify/polaris";
import { AdminOrderDetail } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { ProductionCostSection } from "./ProductionCostSection";
import { OrderExpensesSection } from "./OrderExpensesSection";

type OrderTotalsCardProps = {
  order: AdminOrderDetail;
  orderId: string;
  onUpdate: () => void;
};

export function OrderTotalsCard({
  order,
  orderId,
  onUpdate,
}: OrderTotalsCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Totales
        </Text>
        <DescriptionList
          items={[
            {
              term: "Subtotal",
              description: fmtCurrency(order.subtotalAmount, order.currency),
            },
            ...(order.shippingAmount != null
              ? [
                  {
                    term: "Envío",
                    description: fmtCurrency(
                      order.shippingAmount,
                      order.currency,
                    ),
                  },
                ]
              : []),
            ...(order.taxAmount != null
              ? [
                  {
                    term: "Impuestos",
                    description: fmtCurrency(order.taxAmount, order.currency),
                  },
                ]
              : []),
          ]}
        />
        <Divider />
        <InlineStack align="space-between">
          <Text variant="headingSm" fontWeight="bold" as="span">
            Total
          </Text>
          <Text variant="headingSm" fontWeight="bold" as="span">
            {fmtCurrency(order.totalAmount, order.currency)}
          </Text>
        </InlineStack>
        <Divider />
        <ProductionCostSection
          order={order}
          orderId={orderId}
          onUpdate={onUpdate}
        />
        <Divider />
        <OrderExpensesSection orderId={orderId} />
        <Divider />
        <InlineStack gap="200">
          {order.financialStatus && (
            <Badge
              tone={order.financialStatus === "paid" ? "success" : "enabled"}
            >
              {order.financialStatus}
            </Badge>
          )}
          {order.fulfillmentStatus && (
            <Badge tone="info">{order.fulfillmentStatus}</Badge>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
