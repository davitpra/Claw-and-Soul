"use client";

import { useState } from "react";
import {
  Button,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
  Collapsible,
} from "@shopify/polaris";
import { adminApi, AdminOrderDetail } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";

/** Full Pictorem price/invoice detail for a single order item. */
type PodPriceDetail = Awaited<ReturnType<typeof adminApi.orders.podPrice>>;

type InvoiceLine = { itemId: string; title: string; price: PodPriceDetail };

type PictoremInvoiceSectionProps = {
  order: AdminOrderDetail;
  orderId: string;
};

export function PictoremInvoiceSection({
  order,
  orderId,
}: PictoremInvoiceSectionProps) {
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[] | null>(null);
  const [consultingInvoice, setConsultingInvoice] = useState(false);
  const [showOrderInvoice, setShowOrderInvoice] = useState(false);
  const [invoiceErr, setInvoiceErr] = useState<string | null>(null);

  async function handleConsultInvoice() {
    const podItems = order.items.filter((it) => it.fulfillmentMethod === "pod");
    if (podItems.length === 0) return;
    setConsultingInvoice(true);
    setInvoiceErr(null);
    try {
      const results = await Promise.all(
        podItems.map(async (it) => {
          try {
            const price = await adminApi.orders.podPrice(orderId, it.id);
            return { itemId: it.id, title: it.title, price };
          } catch {
            return null;
          }
        }),
      );
      const lines = results.filter((r): r is InvoiceLine => r !== null);
      setInvoiceLines(lines);
      setShowOrderInvoice(true);
      if (lines.length === 0) {
        setInvoiceErr("No se pudo cotizar ningún item POD en Pictorem.");
      } else if (lines.length < podItems.length) {
        setInvoiceErr(
          `Solo se cotizaron ${lines.length} de ${podItems.length} items POD (algunos sin configuración).`,
        );
      }
    } catch (e) {
      setInvoiceErr((e as Error).message);
    } finally {
      setConsultingInvoice(false);
    }
  }

  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="bodySm" fontWeight="semibold" as="span">
          Precio Pictorem
        </Text>
        <Button
          variant="plain"
          size="micro"
          loading={consultingInvoice}
          disclosure={
            invoiceLines ? (showOrderInvoice ? "up" : "down") : undefined
          }
          onClick={
            invoiceLines
              ? () => setShowOrderInvoice((v) => !v)
              : handleConsultInvoice
          }
        >
          {invoiceLines
            ? showOrderInvoice
              ? "Ocultar detalle de factura"
              : "Ver detalle de factura"
            : "Consultar precio Pictorem"}
        </Button>
      </InlineStack>
      {invoiceErr && (
        <Text variant="bodySm" tone="subdued" as="p">
          {invoiceErr}
        </Text>
      )}
      {invoiceLines && invoiceLines.length > 0 && (
        <Collapsible
          open={showOrderInvoice}
          id="order-invoice"
          transition={{
            duration: "150ms",
            timingFunction: "ease-in-out",
          }}
        >
          <Box
            background="bg-surface-secondary"
            padding="300"
            borderRadius="200"
          >
            <BlockStack gap="300">
              {invoiceLines.map((line, idx) => (
                <BlockStack gap="150" key={line.itemId}>
                  {invoiceLines.length > 1 && (
                    <Text variant="headingSm" as="h3">
                      {line.title}
                    </Text>
                  )}
                  {line.price.components.map((c) => (
                    <InlineStack key={c.code} align="space-between">
                      <Text variant="bodySm" as="span">
                        {c.label}
                      </Text>
                      <Text variant="bodySm" as="span">
                        {c.list === 0
                          ? "Gratis"
                          : fmtCurrency(c.list, line.price.currency)}
                      </Text>
                    </InlineStack>
                  ))}
                  <Divider />
                  {line.price.discount > 0 && (
                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Descuento revendedor
                      </Text>
                      <Text variant="bodySm" tone="success" as="span">
                        −{fmtCurrency(line.price.discount, line.price.currency)}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Subtotal
                    </Text>
                    <Text variant="bodySm" as="span">
                      {fmtCurrency(line.price.subtotal, line.price.currency)}
                    </Text>
                  </InlineStack>
                  {line.price.taxAmount > 0 && (
                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Impuestos ({Math.round(line.price.taxPercentage * 100)}
                        %)
                      </Text>
                      <Text variant="bodySm" as="span">
                        {fmtCurrency(line.price.taxAmount, line.price.currency)}
                      </Text>
                    </InlineStack>
                  )}
                  <InlineStack align="space-between">
                    <Text variant="bodySm" fontWeight="bold" as="span">
                      Total ({line.price.currency})
                    </Text>
                    <Text variant="bodySm" fontWeight="bold" as="span">
                      {fmtCurrency(line.price.total, line.price.currency)}
                    </Text>
                  </InlineStack>
                  {line.price.billing && (
                    <Text variant="bodySm" tone="subdued" as="span">
                      ≈{" "}
                      {fmtCurrency(
                        line.price.billing.total,
                        line.price.billing.currency,
                      )}{" "}
                      · FX {line.price.billing.rateDate}
                    </Text>
                  )}
                  {idx < invoiceLines.length - 1 && <Divider />}
                </BlockStack>
              ))}
              {invoiceLines.length > 1 &&
                (() => {
                  const cur = invoiceLines[0].price.currency;
                  const grand = invoiceLines.reduce(
                    (s, l) => s + l.price.total,
                    0,
                  );
                  const allBilled = invoiceLines.every((l) => l.price.billing);
                  const billCur = invoiceLines[0].price.billing?.currency;
                  const grandBill = allBilled
                    ? invoiceLines.reduce(
                        (s, l) => s + (l.price.billing?.total ?? 0),
                        0,
                      )
                    : null;
                  return (
                    <>
                      <Divider />
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                          Total Pictorem
                        </Text>
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                          {fmtCurrency(grand, cur)}
                        </Text>
                      </InlineStack>
                      {grandBill != null && billCur && (
                        <InlineStack align="space-between">
                          <Text variant="bodySm" tone="subdued" as="span">
                            ≈ en {billCur}
                          </Text>
                          <Text variant="bodySm" tone="subdued" as="span">
                            {fmtCurrency(grandBill, billCur)}
                          </Text>
                        </InlineStack>
                      )}
                    </>
                  );
                })()}
            </BlockStack>
          </Box>
        </Collapsible>
      )}
    </BlockStack>
  );
}
