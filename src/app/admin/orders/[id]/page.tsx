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
} from "@shopify/polaris-icons";
import {
  adminApi,
  AdminOrderDetail,
  AdminOrderItem,
  OrderExpenses,
} from "@/entities/admin/api";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import PrintStudioModal from "./PrintStudioModal";

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

/** Full Pictorem price/invoice detail for a single order item. */
type PodPriceDetail = Awaited<ReturnType<typeof adminApi.orders.podPrice>>;

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

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  pod_production: "Producción (Pictorem)",
  image_generation: "Generación de imagen",
  image_upscale: "Agrandar imagen",
  manual: "Manual",
};

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

type LeadTimeResult = {
  leadTime: number | null;
  label: string | null;
  estimatedReadyAt: string | null;
};

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProductionLeadTimeCard({
  order,
  orderId,
}: {
  order: AdminOrderDetail;
  orderId: string;
}) {
  const podItems = order.items.filter((i) => i.fulfillmentMethod === "pod");

  // Pre-populate from DB values already saved on each item
  const [results, setResults] = useState<Record<string, LeadTimeResult | null>>(
    () =>
      Object.fromEntries(
        podItems
          .filter((i) => i.podLeadTimeDays != null)
          .map((i) => [
            i.id,
            {
              leadTime: i.podLeadTimeDays,
              label:
                i.podLeadTimeDays != null
                  ? `${i.podLeadTimeDays} días hábiles`
                  : null,
              estimatedReadyAt: i.podEstimatedReadyAt,
            },
          ]),
      ),
  );
  const [loadingItem, setLoadingItem] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  if (podItems.length === 0) return null;

  async function handleConsult(itemId: string) {
    setLoadingItem((prev) => ({ ...prev, [itemId]: true }));
    setErrors((prev) => ({ ...prev, [itemId]: null }));
    try {
      const res = await adminApi.orders.podLeadTime(orderId, itemId);
      setResults((prev) => ({
        ...prev,
        [itemId]: {
          leadTime: res.leadTime,
          label: res.label,
          estimatedReadyAt: res.estimatedReadyAt,
        },
      }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [itemId]: (e as Error).message }));
    } finally {
      setLoadingItem((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">
          Lead time de producción
        </Text>
        {podItems.map((item, i) => {
          const result = results[item.id];
          const err = errors[item.id];
          return (
            <div key={item.id}>
              {i > 0 && <Divider />}
              <Box paddingBlock="200">
                <BlockStack gap="100">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="0">
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {item.title}
                      </Text>
                      {(item.size || item.style) && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          {[item.size, item.style].filter(Boolean).join(" · ")}
                        </Text>
                      )}
                    </BlockStack>
                    <InlineStack gap="200" blockAlign="center">
                      {result?.leadTime != null && (
                        <Badge tone="info">
                          {result.label ?? `${result.leadTime} días hábiles`}
                        </Badge>
                      )}
                      <Button
                        size="slim"
                        variant={result ? "plain" : "secondary"}
                        loading={loadingItem[item.id]}
                        onClick={() => handleConsult(item.id)}
                      >
                        {result ? "Actualizar" : "Consultar"}
                      </Button>
                    </InlineStack>
                  </InlineStack>
                  {result?.estimatedReadyAt && (
                    <Text variant="bodySm" tone="subdued" as="span">
                      Listo aprox.:{" "}
                      <strong>{fmtShortDate(result.estimatedReadyAt)}</strong>
                    </Text>
                  )}
                  {err && (
                    <Banner
                      tone="critical"
                      onDismiss={() =>
                        setErrors((prev) => ({ ...prev, [item.id]: null }))
                      }
                    >
                      {err}
                    </Banner>
                  )}
                </BlockStack>
              </Box>
            </div>
          );
        })}
      </BlockStack>
    </Card>
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
  const [productionCostInput, setProductionCostInput] = useState("");
  const [savingCost, setSavingCost] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimateWarning, setEstimateWarning] = useState<string | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<
    { itemId: string; title: string; price: PodPriceDetail }[] | null
  >(null);
  const [consultingInvoice, setConsultingInvoice] = useState(false);
  const [showOrderInvoice, setShowOrderInvoice] = useState(false);
  const [invoiceErr, setInvoiceErr] = useState<string | null>(null);
  const [orderExpenses, setOrderExpenses] = useState<OrderExpenses | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCurrency, setNewExpenseCurrency] = useState("CAD");
  const [newExpenseNote, setNewExpenseNote] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.orders.detail(id);
      setOrder(data);
      setProductionCostInput(data.productionCost?.toString() ?? "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadExpenses() {
    setLoadingExpenses(true);
    try {
      const data = await adminApi.orders.expenses(id);
      setOrderExpenses(data);
      setShowExpenses(true);
    } finally {
      setLoadingExpenses(false);
    }
  }

  async function handleSaveExpense() {
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSavingExpense(true);
    try {
      await adminApi.orders.addExpense(id, {
        amount,
        currency: newExpenseCurrency,
        note: newExpenseNote || undefined,
      });
      setNewExpenseAmount("");
      setNewExpenseNote("");
      setAddingExpense(false);
      await loadExpenses();
    } finally {
      setSavingExpense(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    await adminApi.orders.deleteExpense(expenseId);
    await loadExpenses();
  }

  async function handleResync() {
    setResyncing(true);
    try {
      await adminApi.orders.resync(id);
      await load();
    } finally {
      setResyncing(false);
    }
  }

  async function handleSaveCost() {
    setSavingCost(true);
    try {
      const parsed = productionCostInput.trim()
        ? parseFloat(productionCostInput)
        : null;
      await adminApi.orders.updateProductionCost(
        id,
        parsed != null && !isNaN(parsed) ? parsed : null,
      );
      await load();
    } finally {
      setSavingCost(false);
    }
  }

  async function handleConsultInvoice() {
    if (!order) return;
    const podItems = order.items.filter(
      (it) => it.fulfillmentMethod === "pod",
    );
    if (podItems.length === 0) return;
    setConsultingInvoice(true);
    setInvoiceErr(null);
    try {
      const results = await Promise.all(
        podItems.map(async (it) => {
          try {
            const price = await adminApi.orders.podPrice(id, it.id);
            return { itemId: it.id, title: it.title, price };
          } catch {
            return null;
          }
        }),
      );
      const lines = results.filter(
        (r): r is { itemId: string; title: string; price: PodPriceDetail } =>
          r !== null,
      );
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

  async function handleEstimateCost() {
    if (!order) return;
    setEstimating(true);
    setEstimateWarning(null);
    try {
      const est = await adminApi.orders.productionCostEstimate(id);
      setProductionCostInput(est.amount.toFixed(2));
      if (est.fxUnavailable) {
        setEstimateWarning(
          `FX no disponible — valor en USD (la orden es ${order.currency}). Edita si es necesario.`,
        );
      } else if (est.partial) {
        setEstimateWarning(
          `Solo se cotizaron ${est.itemsPriced} de ${est.itemsTotal} items POD (algunos sin configuración).`,
        );
      }
    } catch {
      setEstimateWarning("No se pudo obtener el costo de Pictorem.");
    } finally {
      setEstimating(false);
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
                <Divider />
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="bodySm" fontWeight="semibold" as="span">
                      Costo de producción
                    </Text>
                    <Button
                      variant="plain"
                      size="micro"
                      loading={estimating}
                      onClick={handleEstimateCost}
                    >
                      Traer de Pictorem
                    </Button>
                  </InlineStack>
                  {estimateWarning && (
                    <Text variant="bodySm" tone="subdued" as="p">
                      {estimateWarning}
                    </Text>
                  )}
                  <InlineStack gap="200" blockAlign="center">
                    <div style={{ flex: 1 }}>
                      <TextField
                        label="Costo de producción"
                        labelHidden
                        type="number"
                        prefix={order.currency}
                        value={productionCostInput}
                        onChange={(v) => {
                          setProductionCostInput(v);
                          setEstimateWarning(null);
                        }}
                        autoComplete="off"
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="slim"
                      loading={savingCost}
                      disabled={
                        productionCostInput ===
                        (order.productionCost?.toString() ?? "")
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
                {order.items.some((it) => it.fulfillmentMethod === "pod") && (
                  <>
                    <Divider />
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
                            invoiceLines
                              ? showOrderInvoice
                                ? "up"
                                : "down"
                              : undefined
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
                                    <InlineStack
                                      key={c.code}
                                      align="space-between"
                                    >
                                      <Text variant="bodySm" as="span">
                                        {c.label}
                                      </Text>
                                      <Text variant="bodySm" as="span">
                                        {c.list === 0
                                          ? "Gratis"
                                          : fmtCurrency(
                                              c.list,
                                              line.price.currency,
                                            )}
                                      </Text>
                                    </InlineStack>
                                  ))}
                                  <Divider />
                                  {line.price.discount > 0 && (
                                    <InlineStack align="space-between">
                                      <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="span"
                                      >
                                        Descuento revendedor
                                      </Text>
                                      <Text
                                        variant="bodySm"
                                        tone="success"
                                        as="span"
                                      >
                                        −
                                        {fmtCurrency(
                                          line.price.discount,
                                          line.price.currency,
                                        )}
                                      </Text>
                                    </InlineStack>
                                  )}
                                  <InlineStack align="space-between">
                                    <Text
                                      variant="bodySm"
                                      tone="subdued"
                                      as="span"
                                    >
                                      Subtotal
                                    </Text>
                                    <Text variant="bodySm" as="span">
                                      {fmtCurrency(
                                        line.price.subtotal,
                                        line.price.currency,
                                      )}
                                    </Text>
                                  </InlineStack>
                                  {line.price.taxAmount > 0 && (
                                    <InlineStack align="space-between">
                                      <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="span"
                                      >
                                        Impuestos (
                                        {Math.round(
                                          line.price.taxPercentage * 100,
                                        )}
                                        %)
                                      </Text>
                                      <Text variant="bodySm" as="span">
                                        {fmtCurrency(
                                          line.price.taxAmount,
                                          line.price.currency,
                                        )}
                                      </Text>
                                    </InlineStack>
                                  )}
                                  <InlineStack align="space-between">
                                    <Text
                                      variant="bodySm"
                                      fontWeight="bold"
                                      as="span"
                                    >
                                      Total ({line.price.currency})
                                    </Text>
                                    <Text
                                      variant="bodySm"
                                      fontWeight="bold"
                                      as="span"
                                    >
                                      {fmtCurrency(
                                        line.price.total,
                                        line.price.currency,
                                      )}
                                    </Text>
                                  </InlineStack>
                                  {line.price.billing && (
                                    <Text
                                      variant="bodySm"
                                      tone="subdued"
                                      as="span"
                                    >
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
                                  const allBilled = invoiceLines.every(
                                    (l) => l.price.billing,
                                  );
                                  const billCur =
                                    invoiceLines[0].price.billing?.currency;
                                  const grandBill = allBilled
                                    ? invoiceLines.reduce(
                                        (s, l) =>
                                          s + (l.price.billing?.total ?? 0),
                                        0,
                                      )
                                    : null;
                                  return (
                                    <>
                                      <Divider />
                                      <InlineStack align="space-between">
                                        <Text
                                          variant="bodyMd"
                                          fontWeight="bold"
                                          as="span"
                                        >
                                          Total Pictorem
                                        </Text>
                                        <Text
                                          variant="bodyMd"
                                          fontWeight="bold"
                                          as="span"
                                        >
                                          {fmtCurrency(grand, cur)}
                                        </Text>
                                      </InlineStack>
                                      {grandBill != null && billCur && (
                                        <InlineStack align="space-between">
                                          <Text
                                            variant="bodySm"
                                            tone="subdued"
                                            as="span"
                                          >
                                            ≈ en {billCur}
                                          </Text>
                                          <Text
                                            variant="bodySm"
                                            tone="subdued"
                                            as="span"
                                          >
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
                  </>
                )}
                <Divider />
                {/* ── Gastos del pedido ── */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="span" variant="headingSm">
                      Gastos del pedido
                    </Text>
                    <Button
                      variant="plain"
                      size="slim"
                      loading={loadingExpenses}
                      onClick={
                        showExpenses
                          ? () => setShowExpenses(false)
                          : loadExpenses
                      }
                    >
                      {showExpenses ? "Ocultar" : "Ver gastos"}
                    </Button>
                  </InlineStack>
                  <Collapsible open={showExpenses} id="order-expenses-collapsible">
                    <BlockStack gap="200">
                      {orderExpenses && orderExpenses.items.length === 0 && (
                        <Text as="p" tone="subdued">
                          Sin gastos registrados aún.
                        </Text>
                      )}
                      {orderExpenses && orderExpenses.items.length > 0 && (
                        <>
                          {Object.entries(orderExpenses.summary).map(
                            ([cat, { count, totalBase }]) => (
                              <InlineStack
                                key={cat}
                                align="space-between"
                                blockAlign="center"
                              >
                                <Text as="span" tone="subdued">
                                  {EXPENSE_CATEGORY_LABELS[cat] ?? cat}
                                  {count > 1 && ` (${count})`}
                                </Text>
                                <Text as="span">
                                  ≈{" "}
                                  {fmtCurrency(
                                    totalBase,
                                    orderExpenses.baseCurrency,
                                  )}
                                </Text>
                              </InlineStack>
                            ),
                          )}
                          <Divider />
                          <InlineStack align="space-between" blockAlign="center">
                            <Text as="span" fontWeight="semibold">
                              Total gastos
                            </Text>
                            <Text as="span" fontWeight="semibold">
                              ≈{" "}
                              {fmtCurrency(
                                orderExpenses.grandTotal,
                                orderExpenses.baseCurrency,
                              )}
                            </Text>
                          </InlineStack>
                          <BlockStack gap="100">
                            {orderExpenses.items.map((exp) => (
                              <InlineStack
                                key={exp.id}
                                align="space-between"
                                blockAlign="center"
                                gap="100"
                              >
                                <BlockStack gap="0">
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    {EXPENSE_CATEGORY_LABELS[exp.category] ??
                                      exp.category}
                                    {exp.note && ` · ${exp.note}`}
                                  </Text>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    {new Date(exp.createdAt).toLocaleDateString(
                                      "es-ES",
                                    )}
                                    {exp.provider && ` · ${exp.provider}`}
                                  </Text>
                                </BlockStack>
                                <InlineStack gap="100" blockAlign="center">
                                  <Text as="span" variant="bodySm">
                                    {fmtCurrency(exp.amount, exp.currency)}
                                    {exp.amountBase !== null &&
                                      exp.baseCurrency !== exp.currency && (
                                        <Text
                                          as="span"
                                          variant="bodySm"
                                          tone="subdued"
                                        >
                                          {" "}
                                          ≈{" "}
                                          {fmtCurrency(
                                            exp.amountBase,
                                            exp.baseCurrency!,
                                          )}
                                        </Text>
                                      )}
                                  </Text>
                                  {exp.source === "admin" && (
                                    <Button
                                      variant="plain"
                                      size="slim"
                                      tone="critical"
                                      onClick={() =>
                                        handleDeleteExpense(exp.id)
                                      }
                                    >
                                      ✕
                                    </Button>
                                  )}
                                </InlineStack>
                              </InlineStack>
                            ))}
                          </BlockStack>
                        </>
                      )}
                      {addingExpense ? (
                        <BlockStack gap="200">
                          <InlineStack gap="200" blockAlign="end">
                            <div style={{ flex: 1 }}>
                              <TextField
                                label="Monto"
                                type="number"
                                value={newExpenseAmount}
                                onChange={setNewExpenseAmount}
                                autoComplete="off"
                              />
                            </div>
                            <div style={{ width: 80 }}>
                              <TextField
                                label="Moneda"
                                value={newExpenseCurrency}
                                onChange={setNewExpenseCurrency}
                                autoComplete="off"
                              />
                            </div>
                          </InlineStack>
                          <TextField
                            label="Nota"
                            value={newExpenseNote}
                            onChange={setNewExpenseNote}
                            autoComplete="off"
                          />
                          <InlineStack gap="200">
                            <Button
                              variant="primary"
                              size="slim"
                              loading={savingExpense}
                              onClick={handleSaveExpense}
                            >
                              Guardar gasto
                            </Button>
                            <Button
                              variant="plain"
                              size="slim"
                              onClick={() => setAddingExpense(false)}
                            >
                              Cancelar
                            </Button>
                          </InlineStack>
                        </BlockStack>
                      ) : (
                        showExpenses && (
                          <Button
                            variant="plain"
                            size="slim"
                            onClick={() => setAddingExpense(true)}
                          >
                            + Agregar gasto manual
                          </Button>
                        )
                      )}
                    </BlockStack>
                  </Collapsible>
                </BlockStack>
                <Divider />
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
            <ProductionLeadTimeCard order={order} orderId={id} />
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
