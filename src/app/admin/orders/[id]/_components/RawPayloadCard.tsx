"use client";

import { useState } from "react";
import { Card, Button, BlockStack, Box, Collapsible } from "@shopify/polaris";
import { AdminOrderDetail } from "@/entities/admin/api";

type RawPayloadCardProps = {
  order: AdminOrderDetail;
};

export function RawPayloadCard({ order }: RawPayloadCardProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <Card>
      <BlockStack gap="300">
        <Button
          variant="plain"
          onClick={() => setShowRaw((v) => !v)}
          disclosure={showRaw ? "up" : "down"}
        >
          Payload de Shopify (JSON)
        </Button>
        <Collapsible id="raw-json" open={showRaw}>
          <Box
            background="bg-surface-secondary"
            padding="400"
            borderRadius="200"
          >
            <pre
              style={{
                fontSize: 11,
                color: "#5c5f62",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {JSON.stringify(order, null, 2)}
            </pre>
          </Box>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
