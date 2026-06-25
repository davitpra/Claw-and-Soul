"use client";

import { useRef, useState } from "react";
import {
  Card,
  Badge,
  Banner,
  Text,
  InlineStack,
  BlockStack,
  Divider,
} from "@shopify/polaris";
import { adminApi, AdminOrderItem } from "@/entities/admin/api";
import { VALID_TRANSITIONS } from "@/entities/admin/lib/order-transitions";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import PrintStudioModal from "./PrintStudioModal";
import { ItemActionsBar } from "./ItemActionsBar";
import { ItemFulfillmentControl } from "./ItemFulfillmentControl";
import { ItemMediaRow } from "./ItemMediaRow";
import { ItemStatusSelect } from "./ItemStatusSelect";

type OrderItemCardProps = {
  item: AdminOrderItem;
  orderId: string;
  currency: string;
  shopifyImageUrl?: string | null;
  onUpdate: () => void;
  onRequestCancel: (itemIds: string[]) => void;
};

export function OrderItemCard({
  item,
  orderId,
  currency,
  shopifyImageUrl,
  onUpdate,
  onRequestCancel,
}: OrderItemCardProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "in_house" | "pod"
  >(item.fulfillmentMethod as "in_house" | "pod");
  const [savingFulfillment, setSavingFulfillment] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Imagen del producto de Shopify relacionado: imagen de la variante comprada
  // (live desde Shopify) → imagen del catálogo (primaria/galería) → preview del
  // estilo. No cae al arte del cliente.
  const productImage =
    shopifyImageUrl ??
    item.productRef?.images?.[0]?.imageUrl ??
    item.productRef?.style?.images?.[0]?.imageUrl ??
    null;
  // Imagen generada por el usuario (IA): thumbnail para la card, full para la vista ampliada.
  const generatedThumb =
    item.generation?.thumbnailUrl ?? item.generation?.resultUrl ?? null;
  const generatedFull =
    item.generation?.resultUrl ?? item.generation?.thumbnailUrl ?? null;
  // Imagen final para impresión.
  const printImage = item.printImageUrl ?? null;
  const allowed = VALID_TRANSITIONS[item.productionStatus] ?? [];

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      setErr("El archivo debe ser una imagen");
      return;
    }
    setUploadingImage(true);
    setErr(null);
    try {
      await adminApi.orders.uploadPrintImage(orderId, item.id, file);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleFulfillmentChange(value: string) {
    const method = value as "in_house" | "pod";
    setFulfillmentMethod(method);
    setSavingFulfillment(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemFulfillment(orderId, item.id, method);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
      setFulfillmentMethod(item.fulfillmentMethod as "in_house" | "pod");
    } finally {
      setSavingFulfillment(false);
    }
  }

  async function handleStatusChange(toStatus: string) {
    setUpdatingStatus(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemStatus(orderId, item.id, toStatus);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleStatusSelect(value: string) {
    if (value === "cancelled") {
      onRequestCancel([item.id]);
    } else {
      handleStatusChange(value);
    }
  }

  return (
    <>
      {showStudio && (
        <PrintStudioModal
          orderId={orderId}
          item={item}
          onClose={() => setShowStudio(false)}
          onApplied={onUpdate}
        />
      )}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          title={item.title}
          onClose={() => setPreviewSrc(null)}
        />
      )}

      <ItemActionsBar
        hasPrintImage={!!item.printImageUrl}
        uploading={uploadingImage}
        fileInputRef={fileInputRef}
        onUploadClick={() => fileInputRef.current?.click()}
        onUploadChange={handleUploadImage}
        onOpenStudio={() => setShowStudio(true)}
      />
      <Divider />
      <ItemFulfillmentControl
        value={fulfillmentMethod}
        disabled={savingFulfillment}
        onChange={handleFulfillmentChange}
        productionStatus={item.productionStatus}
      />

      <Card>
        <BlockStack gap="300">
          <ItemMediaRow
            image={productImage}
            alt={item.productRef?.displayName ?? item.title}
          >
            <InlineStack
              align="space-between"
              blockAlign="center"
              gap="400"
              wrap={false}
            >
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Producto de Shopify
                </Text>
                <Text variant="bodyMd" fontWeight="semibold" as="span">
                  {item.productRef?.displayName ??
                    item.productRef?.name ??
                    item.title}
                </Text>
                {item.productVariant?.shopifyVariantTitle && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    {item.productVariant.shopifyVariantTitle}
                  </Text>
                )}
                {item.sku && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    SKU: {item.sku}
                  </Text>
                )}
              </BlockStack>
              <InlineStack gap="400" blockAlign="center" wrap={false}>
                <InlineStack gap="150" blockAlign="center" wrap={false}>
                  <Text variant="bodyMd" tone="subdued" as="span">
                    {fmtCurrency(item.unitPrice, currency)} ×
                  </Text>
                  <Badge>{String(item.quantity)}</Badge>
                </InlineStack>
                <Text variant="bodyMd" fontWeight="semibold" as="span">
                  {fmtCurrency(item.totalPrice, currency)}
                </Text>
              </InlineStack>
            </InlineStack>
          </ItemMediaRow>

          <Divider />

          <ItemMediaRow
            image={generatedThumb}
            alt={item.title}
            onZoom={
              generatedFull ? () => setPreviewSrc(generatedFull) : undefined
            }
          >
            <BlockStack gap="050">
              <Text variant="bodySm" tone="subdued" as="span">
                Imagen generada
              </Text>
              <Text variant="bodyMd" fontWeight="semibold" as="span">
                {item.title}
              </Text>
              {item.variantTitle && (
                <Text variant="bodySm" tone="subdued" as="span">
                  {item.variantTitle}
                </Text>
              )}
              <Text variant="bodySm" tone="subdued" as="span">
                {item.id}
              </Text>
            </BlockStack>
          </ItemMediaRow>

          <Divider />

          <ItemMediaRow
            image={printImage}
            alt={item.title}
            onZoom={printImage ? () => setPreviewSrc(printImage) : undefined}
          >
            <Text variant="bodySm" tone="subdued" as="span">
              Imagen para impresión
            </Text>
          </ItemMediaRow>

          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}

          {allowed.length > 0 && (
            <>
              <Divider />
              <ItemStatusSelect
                allowed={allowed}
                disabled={updatingStatus}
                onSelect={handleStatusSelect}
              />
            </>
          )}
        </BlockStack>
      </Card>
    </>
  );
}
