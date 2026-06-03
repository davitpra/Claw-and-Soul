"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Page,
  Layout,
  Card,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
  Collapsible,
  Thumbnail,
  DescriptionList,
  TextField,
  Select,
  Modal,
  Checkbox,
} from "@shopify/polaris";
import {
  RefreshIcon,
  ExternalIcon,
  SendIcon,
  ResetIcon,
  ImageIcon,
  MagicIcon,
  ViewIcon,
} from "@shopify/polaris-icons";
import {
  adminApi,
  AdminOrderDetail,
  AdminOrderItem,
} from "@/entities/admin/api";
import EnhanceImageModal from "./EnhanceImageModal";
import ImagePreviewModal from "./ImagePreviewModal";
import PrintProofModal from "./PrintProofModal";

const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const STATUS_TONES: Record<
  string,
  "info" | "warning" | "attention" | "success" | "enabled" | "critical"
> = {
  pending: "attention",
  paid: "info",
  in_production: "warning",
  shipped: "attention",
  delivered: "success",
  cancelled: "enabled",
  refunded: "critical",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["in_production", "cancelled", "refunded"],
  paid: ["in_production", "cancelled", "refunded"],
  in_production: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

/** Production states from which an item can still be cancelled (not yet shipped). */
const CANCELLABLE_STATUSES = ["pending", "paid", "in_production"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatAddress(addr: Record<string, string> | null): string {
  if (!addr) return "—";
  return [
    [addr.first_name, addr.last_name].filter(Boolean).join(" "),
    addr.address1,
    addr.address2,
    [addr.city, addr.province, addr.zip].filter(Boolean).join(" "),
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function OrderItemCard({
  item,
  orderId,
  currency,
  onUpdate,
  onRequestCancel,
  cancelInfo,
}: {
  item: AdminOrderItem;
  orderId: string;
  currency: string;
  onUpdate: () => void;
  onRequestCancel: (itemIds: string[]) => void;
  cancelInfo: { refunded: boolean } | null;
}) {
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
  const [submittingPod, setSubmittingPod] = useState(false);
  const [syncingPod, setSyncingPod] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEnhance, setShowEnhance] = useState(false);
  const [showProof, setShowProof] = useState(false);
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

  async function handlePodSubmit(force = false) {
    setSubmittingPod(true);
    setErr(null);
    try {
      await adminApi.orders.podSubmit(orderId, item.id, force);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmittingPod(false);
    }
  }

  async function handlePodSync() {
    setSyncingPod(true);
    setErr(null);
    try {
      await adminApi.orders.podSync(orderId, item.id);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSyncingPod(false);
    }
  }

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
      {showEnhance && (
        <EnhanceImageModal
          orderId={orderId}
          itemId={item.id}
          onClose={() => setShowEnhance(false)}
          onApplied={onUpdate}
        />
      )}
      {showProof && (
        <PrintProofModal
          orderId={orderId}
          item={item}
          onClose={() => setShowProof(false)}
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
                onClick={() => setShowEnhance(true)}
              >
                Mejorar imagen
              </Button>
              <Button
                size="micro"
                icon={ViewIcon}
                onClick={() => setShowProof(true)}
              >
                Vista de prueba
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

        {/* POD section — visible only when fulfillmentMethod is pod */}
        {fulfillmentMethod === "pod" && (
          <>
            <Divider />
            <BlockStack gap="200">
              {item.productionStatus === "cancelled" &&
                item.podOrderId &&
                (cancelInfo ? (
                  <Banner tone="info">
                    Cancelado{cancelInfo.refunded ? " y reembolsado" : ""} en
                    Shopify por la app.
                  </Banner>
                ) : (
                  <Banner tone="warning">
                    Orden #{item.podOrderId} eliminada en Pictorem (remove
                    quote). Verifica si debes{" "}
                    <strong>reembolsar al cliente en Shopify</strong>.
                  </Banner>
                ))}
              <InlineStack gap="200" blockAlign="center">
                <Text variant="bodySm" fontWeight="semibold" as="span">
                  Pictorem POD
                </Text>
                {item.podOrderId ? (
                  <Badge tone="info">{`#${item.podOrderId}`}</Badge>
                ) : (
                  <Badge tone="enabled">Sin enviar</Badge>
                )}
                {item.podProvider && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    · {item.podProvider}
                  </Text>
                )}
              </InlineStack>
              <InlineStack gap="200">
                <Button
                  size="slim"
                  icon={SendIcon}
                  loading={submittingPod}
                  onClick={() => handlePodSubmit(!!item.podOrderId)}
                >
                  {item.podOrderId ? "Re-enviar" : "Enviar a Pictorem"}
                </Button>
                {item.podOrderId && (
                  <Button
                    size="slim"
                    icon={ResetIcon}
                    loading={syncingPod}
                    onClick={handlePodSync}
                  >
                    Actualizar estado
                  </Button>
                )}
              </InlineStack>
            </BlockStack>
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

function CancelOrderModal({
  order,
  itemIds,
  onClose,
  onDone,
}: {
  order: AdminOrderDetail;
  itemIds: string[];
  onClose: () => void;
  onDone: (warnings: string[]) => void;
}) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(true);
  const [restock, setRestock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const targets = order.items.filter((i) => itemIds.includes(i.id));
  const podSubmitted = targets.filter(
    (i) => i.fulfillmentMethod === "pod" && i.podOrderId,
  );
  const remainingActive = order.items.filter(
    (i) =>
      !itemIds.includes(i.id) &&
      !["cancelled", "refunded"].includes(i.productionStatus),
  );
  const wholeOrder = remainingActive.length === 0;

  async function handleConfirm() {
    setSubmitting(true);
    setErr(null);
    try {
      const res = await adminApi.orders.cancel(order.id, {
        itemIds,
        reason: reason.trim() || undefined,
        refund,
        restock,
      });
      onDone(res.warnings);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={
        wholeOrder
          ? "Cancelar pedido"
          : `Cancelar ${targets.length} item${targets.length > 1 ? "s" : ""}`
      }
      primaryAction={{
        content: "Confirmar cancelación",
        destructive: true,
        loading: submitting,
        onAction: handleConfirm,
      }}
      secondaryActions={[
        { content: "Volver", onAction: onClose, disabled: submitting },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}
          {wholeOrder ? (
            <Banner tone="warning">
              Se cancelará el <strong>pedido completo</strong> en Shopify
              {refund ? " y se reembolsará al cliente" : ""}.
            </Banner>
          ) : (
            <Banner tone="info">
              Se hará un <strong>reembolso parcial</strong> en Shopify de los
              items seleccionados. El resto del pedido sigue activo.
            </Banner>
          )}
          {podSubmitted.length > 0 && (
            <Banner tone="warning">
              {podSubmitted.length} item
              {podSubmitted.length > 1 ? "s ya enviados" : " ya enviado"} a
              Pictorem. La app no puede cancelarlo automáticamente — deberás
              contactar a soporte de Pictorem manualmente.
            </Banner>
          )}
          <TextField
            label="Motivo (opcional)"
            value={reason}
            onChange={setReason}
            autoComplete="off"
            multiline={2}
          />
          <Checkbox
            label="Reembolsar al cliente en Shopify"
            checked={refund}
            onChange={setRefund}
            disabled={!wholeOrder}
            helpText={
              !wholeOrder
                ? "El reembolso parcial siempre devuelve el importe de las líneas seleccionadas."
                : undefined
            }
          />
          <Checkbox
            label="Reponer inventario (restock)"
            checked={restock}
            onChange={setRestock}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [cancelItemIds, setCancelItemIds] = useState<string[] | null>(null);
  const [cancelWarnings, setCancelWarnings] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.orders.detail(id);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResync() {
    setResyncing(true);
    try {
      await adminApi.orders.resync(id);
      await load();
    } finally {
      setResyncing(false);
    }
  }

  if (loading) {
    return (
      <Box padding="600">
        <InlineStack align="center" gap="300">
          <Spinner />
          <Text as="span" tone="subdued">
            Cargando pedido…
          </Text>
        </InlineStack>
      </Box>
    );
  }

  if (!order) {
    return (
      <Page
        backAction={{ url: "/admin/orders", content: "Pedidos" }}
        title="Pedido no encontrado"
      >
        <Text as="p" tone="subdued">
          No se encontró el pedido.
        </Text>
      </Page>
    );
  }

  const shopifyAdminUrl = `https://clawandsoul.myshopify.com/admin/orders/${order.shopifyOrderId}`;

  const overallTones = order.items.map((i) => i.productionStatus);
  const dominantStatus =
    [...new Set(overallTones)].length === 1 ? overallTones[0] : "mixed";

  const cancellableIds = order.items
    .filter((i) => CANCELLABLE_STATUSES.includes(i.productionStatus))
    .map((i) => i.id);

  // Map itemId → { refunded } from app-driven "order_cancelled" events, so the
  // POD banner can tell whether Shopify was already handled by the cancel flow.
  // events come newest-first; keep the most recent entry per item.
  const cancelInfoByItem = new Map<string, { refunded: boolean }>();
  for (const ev of order.events) {
    if (ev.eventType !== "order_cancelled") continue;
    const p = ev.payload as {
      itemIds?: string[];
      refund?: boolean;
      shopifyAction?: string;
    } | null;
    const refunded =
      p?.shopifyAction === "partial_refund" || p?.refund === true;
    for (const itemId of p?.itemIds ?? []) {
      if (!cancelInfoByItem.has(itemId))
        cancelInfoByItem.set(itemId, { refunded });
    }
  }

  return (
    <Page
      backAction={{ url: "/admin/orders", content: "Pedidos" }}
      title={order.orderNumber}
      subtitle={fmtDate(order.shopifyCreatedAt)}
      titleMetadata={
        <Badge tone={STATUS_TONES[dominantStatus] ?? "enabled"}>
          {PRODUCTION_STATUS_LABELS[dominantStatus] ?? dominantStatus}
        </Badge>
      }
      secondaryActions={[
        {
          content: "Resincronizar",
          icon: RefreshIcon,
          loading: resyncing,
          onAction: handleResync,
        },
        {
          content: "Cancelar pedido",
          destructive: true,
          disabled: cancellableIds.length === 0,
          onAction: () => setCancelItemIds(cancellableIds),
        },
        {
          content: "Ver en Shopify",
          icon: ExternalIcon,
          url: shopifyAdminUrl,
          external: true,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {cancelWarnings.length > 0 && (
              <Banner
                tone="warning"
                title="Acción manual requerida en Pictorem"
                onDismiss={() => setCancelWarnings([])}
              >
                <BlockStack gap="100">
                  {cancelWarnings.map((w, i) => (
                    <Text as="p" key={i} variant="bodySm">
                      {w}
                    </Text>
                  ))}
                </BlockStack>
              </Banner>
            )}
            <Text variant="headingMd" as="h2">
              Items ({order.items.length})
            </Text>
            {order.items.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                orderId={id}
                currency={order.currency}
                onUpdate={load}
                onRequestCancel={setCancelItemIds}
                cancelInfo={cancelInfoByItem.get(item.id) ?? null}
              />
            ))}

            {order.events.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h2">
                    Historial de eventos
                  </Text>
                  {order.events.map((ev, i) => (
                    <div key={ev.id}>
                      {i > 0 && <Divider />}
                      <Box paddingBlock="200">
                        <InlineStack gap="300" blockAlign="start">
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#448da6",
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                          <BlockStack gap="0">
                            <Text variant="bodyMd" as="span">
                              <strong>{ev.eventType.replace(/_/g, " ")}</strong>
                              {ev.fromStatus && ev.toStatus && (
                                <Text as="span" tone="subdued">
                                  {" "}
                                  ·{" "}
                                  {PRODUCTION_STATUS_LABELS[ev.fromStatus] ??
                                    ev.fromStatus}{" "}
                                  →{" "}
                                  {PRODUCTION_STATUS_LABELS[ev.toStatus] ??
                                    ev.toStatus}
                                </Text>
                              )}
                            </Text>
                            <Text variant="bodySm" tone="subdued" as="span">
                              {fmtDate(ev.createdAt)} · {ev.source}
                            </Text>
                          </BlockStack>
                        </InlineStack>
                      </Box>
                    </div>
                  ))}
                </BlockStack>
              </Card>
            )}

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
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
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

            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Totales
                </Text>
                <DescriptionList
                  items={[
                    {
                      term: "Subtotal",
                      description: fmtCurrency(
                        order.subtotalAmount,
                        order.currency,
                      ),
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
                            description: fmtCurrency(
                              order.taxAmount,
                              order.currency,
                            ),
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
                <InlineStack gap="200">
                  {order.financialStatus && (
                    <Badge
                      tone={
                        order.financialStatus === "paid" ? "success" : "enabled"
                      }
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
          </BlockStack>
        </Layout.Section>
      </Layout>

      {cancelItemIds && (
        <CancelOrderModal
          order={order}
          itemIds={cancelItemIds}
          onClose={() => setCancelItemIds(null)}
          onDone={(w) => {
            setCancelItemIds(null);
            setCancelWarnings(w);
            load();
          }}
        />
      )}
    </Page>
  );
}
