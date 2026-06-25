"use client";

import Link from "next/link";
import {
  Card,
  Button,
  Text,
  BlockStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { AdminOrderDetail } from "@/entities/admin/api";
import { formatAddress } from "@/entities/admin/lib/order-format";

type CustomerCardProps = {
  order: AdminOrderDetail;
};

export function CustomerCard({ order }: CustomerCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Cliente
        </Text>
        {order.user ? (
          <Link href={`/admin/users/${order.user.id}`}>
            <Button variant="plain">
              {order.user.fullName || order.user.email}
            </Button>
          </Link>
        ) : order.customerEmail ? (
          <BlockStack gap="0">
            <Text as="span">{order.customerEmail}</Text>
            <Text as="span" tone="subdued" variant="bodySm">
              Invitado
            </Text>
          </BlockStack>
        ) : (
          <Text as="span" tone="subdued">
            Sin cliente vinculado
          </Text>
        )}
        {order.customerPhone && (
          <Text as="span" tone="subdued">
            {order.customerPhone}
          </Text>
        )}
        {order.customerNote && (
          <Box
            background="bg-surface-secondary"
            padding="300"
            borderRadius="200"
          >
            <Text variant="bodySm" tone="subdued" as="span">
              <strong>Nota:</strong> {order.customerNote}
            </Text>
          </Box>
        )}
        <Divider />
        <BlockStack gap="200">
          <Text variant="headingSm" as="h3">
            Dirección de envío
          </Text>
          <Text variant="bodySm" tone="subdued" as="span">
            {formatAddress(order.shippingAddress)}
          </Text>
          <Text variant="headingSm" as="h3">
            Dirección de facturación
          </Text>
          <Text variant="bodySm" tone="subdued" as="span">
            {formatAddress(order.billingAddress)}
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
