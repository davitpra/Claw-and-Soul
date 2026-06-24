"use client";

import { useRef, useState } from "react";
import {
  Card,
  Badge,
  Button,
  Banner,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Thumbnail,
  TextField,
  Select,
} from "@shopify/polaris";
import { ImageIcon, MagicIcon } from "@shopify/polaris-icons";
import { adminApi, AdminOrderItem } from "@/entities/admin/api";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_TONES as STATUS_TONES,
} from "@/entities/admin/lib/production-status";
import { VALID_TRANSITIONS } from "@/entities/admin/lib/order-transitions";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import PrintStudioModal from "./PrintStudioModal";

type OrderItemCardProps = {
  item: AdminOrderItem;
  orderId: string;
  currency: string;
  onUpdate: () => void;
  onRequestCancel: (itemIds: string[]) => void;
};

export function OrderItemCard({
  item,
  orderId,
  currency,
  onUpdate,
  onRequestCancel,
}: OrderItemCardProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showTracking, setShowTracking] = useState(!!item.trackingNumber);
  const [trackingNumber, setTrackingNumber] = useState(
    item.trackingNumber ?? "",
  );
  const [trackingUrl, setTrackingUrl] = useState(item.trackingUrl ?? "");
  const [trackingCarrier, setTrackingCarrier] = useState(
    item.trackingCarrier ?? "",
  );
  const [savingTracking, setSavingTracking] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "in_house" | "pod"
  >(item.fulfillmentMethod as "in_house" | "pod");
  const [savingFulfillment, setSavingFulfillment] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thumb =
    item.printImageUrl ??
    item.generation?.thumbnailUrl ??
    item.generation?.resultUrl ??
    item.imageUrl;
  // Full-resolution image for the large preview (skip the small thumbnail).
  const fullImage =
    item.printImageUrl ?? item.generation?.resultUrl ?? item.imageUrl ?? thumb;
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

  async function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setSavingTracking(true);
    setErr(null);
    try {
      await adminApi.orders.updateTracking(orderId, item.id, {
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim() || undefined,
        trackingCarrier: trackingCarrier.trim() || undefined,
      });
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSavingTracking(false);
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
      {showImage && fullImage && (
        <ImagePreviewModal
          src={fullImage}
          title={item.title}
          onClose={() => setShowImage(false)}
        />
      )}
      <Card>
        <BlockStack gap="300">
          <InlineStack gap="400" blockAlign="start">
            <div style={{ flexShrink: 0 }}>
              <BlockStack gap="100" inlineAlign="center">
                {thumb ? (
                  <button
                    type="button"
                    onClick={() => setShowImage(true)}
                    title="Ver imagen en grande"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "zoom-in",
                    }}
                  >
                    <Thumbnail source={thumb} alt={item.title} size="medium" />
                  </button>
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      background: "#f6f6f7",
                      border: "1px solid #e3e3e3",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text as="span" tone="subdued" variant="bodySm">
                      —
                    </Text>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleUploadImage}
                />
                <Button
                  size="micro"
                  icon={ImageIcon}
                  loading={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {item.printImageUrl ? "Reemplazar" : "Subir imagen"}
                </Button>
                <Button
                  size="micro"
                  icon={MagicIcon}
                  onClick={() => setShowStudio(true)}
                >
                  Editar para impresión
                </Button>
                {item.printImageUrl && (
                  <Badge tone="info">Imagen personalizada</Badge>
                )}
              </BlockStack>
            </div>

            <BlockStack gap="100" align="start">
              <InlineStack align="space-between" gap="200">
                <BlockStack gap="0">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {item.title}
                  </Text>
                  {item.variantTitle && (
                    <Text variant="bodySm" tone="subdued" as="span">
                      {item.variantTitle}
                    </Text>
                  )}
                  <InlineStack gap="200">
                    {item.style && (
                      <Text variant="bodySm" tone="subdued" as="span">
                        Estilo: {item.style}
                      </Text>
                    )}
                    {item.size && (
                      <Text variant="bodySm" tone="subdued" as="span">
                        Tamaño: {item.size}
                      </Text>
                    )}
                  </InlineStack>
                </BlockStack>
                <BlockStack gap="0" inlineAlign="end">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {fmtCurrency(item.totalPrice, currency)}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="span">
                    {item.quantity} × {fmtCurrency(item.unitPrice, currency)}
                  </Text>
                </BlockStack>
              </InlineStack>

              <InlineStack gap="200" blockAlign="center">
                <div style={{ minWidth: 180 }}>
                  <Select
                    label=""
                    labelHidden
                    options={[
                      { label: "Taller (in-house)", value: "in_house" },
                      { label: "POD (proveedor externo)", value: "pod" },
                    ]}
                    value={fulfillmentMethod}
                    onChange={handleFulfillmentChange}
                    disabled={savingFulfillment}
                  />
                </div>
                <Badge tone={STATUS_TONES[item.productionStatus] ?? "enabled"}>
                  {PRODUCTION_STATUS_LABELS[item.productionStatus] ??
                    item.productionStatus}
                </Badge>
              </InlineStack>
            </BlockStack>
          </InlineStack>

          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}

          {allowed.length > 0 && (
            <>
              <Divider />
              <InlineStack gap="200" blockAlign="center">
                <Text variant="bodySm" tone="subdued" as="span">
                  Cambiar estado:
                </Text>
                {allowed.map((s) => (
                  <Button
                    key={s}
                    size="slim"
                    variant="secondary"
                    tone={s === "cancelled" ? "critical" : undefined}
                    loading={updatingStatus}
                    onClick={() =>
                      s === "cancelled"
                        ? onRequestCancel([item.id])
                        : handleStatusChange(s)
                    }
                  >
                    → {PRODUCTION_STATUS_LABELS[s]}
                  </Button>
                ))}
              </InlineStack>
            </>
          )}

          <Divider />

          {!showTracking ? (
            <Button
              variant="plain"
              size="slim"
              onClick={() => setShowTracking(true)}
            >
              + Agregar tracking
            </Button>
          ) : (
            <form onSubmit={handleSaveTracking}>
              <InlineStack gap="200" blockAlign="end" wrap>
                <div style={{ flex: "1 1 180px" }}>
                  <TextField
                    label="Número de tracking"
                    value={trackingNumber}
                    onChange={setTrackingNumber}
                    placeholder="Ej: 1Z999AA10123456784"
                    autoComplete="off"
                  />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <TextField
                    label="URL (opcional)"
                    value={trackingUrl}
                    onChange={setTrackingUrl}
                    placeholder="https://track.carrier.com/…"
                    autoComplete="off"
                  />
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <TextField
                    label="Transportista"
                    value={trackingCarrier}
                    onChange={setTrackingCarrier}
                    placeholder="UPS, FedEx…"
                    autoComplete="off"
                  />
                </div>
                <Button
                  submit
                  variant="primary"
                  size="slim"
                  loading={savingTracking}
                >
                  Guardar
                </Button>
              </InlineStack>
            </form>
          )}

          {item.trackingNumber && !showTracking && (
            <InlineStack gap="200" blockAlign="center">
              <Text variant="bodySm" tone="subdued" as="span">
                Tracking: {item.trackingNumber}
              </Text>
              {item.trackingUrl && (
                <a
                  href={item.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#448da6", fontSize: 13 }}
                >
                  Ver →
                </a>
              )}
            </InlineStack>
          )}
        </BlockStack>
      </Card>
    </>
  );
}
