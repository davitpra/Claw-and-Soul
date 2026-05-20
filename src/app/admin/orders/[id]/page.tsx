"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { adminApi, AdminOrderDetail, AdminOrderItem } from "@/entities/admin/api";

const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-blue-100 text-blue-700",
  in_production: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-red-100 text-red-600",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  paid: ["in_production", "cancelled", "refunded"],
  in_production: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {PRODUCTION_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function AddressBlock({ addr }: { addr: Record<string, string> | null }) {
  if (!addr) return <span className="text-text-muted text-sm">—</span>;
  const parts = [
    [addr.first_name, addr.last_name].filter(Boolean).join(" "),
    addr.address1,
    addr.address2,
    [addr.city, addr.province, addr.zip].filter(Boolean).join(" "),
    addr.country,
  ].filter(Boolean);
  return (
    <div className="text-sm text-text-main space-y-0.5">
      {parts.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function OrderItemCard({
  item,
  orderId,
  currency,
  onUpdate,
}: {
  item: AdminOrderItem;
  orderId: string;
  currency: string;
  onUpdate: () => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showTracking, setShowTracking] = useState(!!item.trackingNumber);
  const [trackingNumber, setTrackingNumber] = useState(item.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(item.trackingUrl ?? "");
  const [trackingCarrier, setTrackingCarrier] = useState(item.trackingCarrier ?? "");
  const [savingTracking, setSavingTracking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const thumb = item.generation?.thumbnailUrl ?? item.generation?.resultUrl ?? item.imageUrl;
  const allowed = VALID_TRANSITIONS[item.productionStatus] ?? [];

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
    <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-4">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl border border-[#E0DED9] overflow-hidden bg-cream/40 shrink-0">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-text-muted text-2xl">image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-text-main text-sm">{item.title}</p>
              {item.variantTitle && (
                <p className="text-xs text-text-muted mt-0.5">{item.variantTitle}</p>
              )}
              <div className="flex gap-3 mt-1 text-xs text-text-muted">
                {item.style && <span>Estilo: {item.style}</span>}
                {item.size && <span>Tamaño: {item.size}</span>}
                {item.sku && <span>SKU: {item.sku}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-text-main text-sm">
                {fmtCurrency(item.totalPrice, currency)}
              </p>
              <p className="text-xs text-text-muted">{item.quantity} × {fmtCurrency(item.unitPrice, currency)}</p>
            </div>
          </div>

          {/* Generation link */}
          {item.generation && (
            <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>{item.generation.pet?.name ?? "Mascota"} · {item.generation.style?.displayName ?? "—"}</span>
            </div>
          )}

          {/* Method badge */}
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.fulfillmentMethod === "pod" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
              <span className="material-symbols-outlined text-[13px]">{item.fulfillmentMethod === "pod" ? "local_shipping" : "store"}</span>
              {item.fulfillmentMethod === "pod" ? "POD" : "Taller"}
            </span>
            <StatusBadge status={item.productionStatus} />
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>
      )}

      {/* Status changer */}
      {allowed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E0DED9] flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted font-medium">Cambiar estado:</span>
          {allowed.map((s) => (
            <button
              key={s}
              disabled={updatingStatus}
              onClick={() => handleStatusChange(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-50 transition-colors"
            >
              → {PRODUCTION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Tracking */}
      <div className="mt-3 pt-3 border-t border-[#E0DED9]">
        {!showTracking ? (
          <button
            onClick={() => setShowTracking(true)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Agregar tracking
          </button>
        ) : (
          <form onSubmit={handleSaveTracking} className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-text-muted font-medium">Número</label>
              <input
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ej: 1Z999AA10123456784"
                className="border border-[#E0DED9] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-text-muted font-medium">URL (opcional)</label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.carrier.com/…"
                className="border border-[#E0DED9] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-text-muted font-medium">Transportista</label>
              <input
                value={trackingCarrier}
                onChange={(e) => setTrackingCarrier(e.target.value)}
                placeholder="UPS, FedEx…"
                className="border border-[#E0DED9] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 w-32"
              />
            </div>
            <button
              type="submit"
              disabled={savingTracking}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {savingTracking ? "Guardando…" : "Guardar"}
            </button>
          </form>
        )}
        {item.trackingNumber && !showTracking && (
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            {item.trackingNumber}
            {item.trackingUrl && (
              <a href={item.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Ver →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.orders.detail(id);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResync() {
    setResyncing(true);
    try {
      await adminApi.orders.resync(id);
      await load();
    } finally {
      setResyncing(false);
    }
  }

  const shopifyAdminUrl = order
    ? `https://clawandsoul.myshopify.com/admin/orders/${order.shopifyOrderId}`
    : "#";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-text-muted">shopping_bag</span>
        <p className="text-text-muted">Pedido no encontrado</p>
        <Link href="/admin/orders" className="text-primary hover:underline text-sm">← Volver a pedidos</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/admin" className="hover:text-text-main">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/admin/orders" className="hover:text-text-main">Pedidos</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-text-main font-semibold">{order.orderNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">{order.orderNumber}</h1>
          <p className="text-sm text-text-muted mt-0.5">{fmtDate(order.shopifyCreatedAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleResync}
            disabled={resyncing}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E0DED9] rounded-xl text-sm hover:bg-cream disabled:opacity-60 transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${resyncing ? "animate-spin" : ""}`}>sync</span>
            Resincronizar
          </button>
          <a
            href={shopifyAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E0DED9] rounded-xl text-sm hover:bg-cream transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Ver en Shopify
          </a>
        </div>
      </div>

      {/* Customer + Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-5">
          <h2 className="font-semibold text-text-main text-sm mb-3">Cliente</h2>
          {order.user ? (
            <Link href={`/admin/users/${order.user.id}`} className="text-primary hover:underline text-sm font-medium">
              {order.user.fullName || order.user.email}
            </Link>
          ) : order.customerEmail ? (
            <p className="text-sm text-text-muted">{order.customerEmail} <span className="text-xs">(invitado)</span></p>
          ) : (
            <p className="text-sm text-text-muted">Sin cliente vinculado</p>
          )}
          {order.customerPhone && (
            <p className="text-sm text-text-muted mt-1">{order.customerPhone}</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-text-muted mb-1">Dirección de envío</p>
              <AddressBlock addr={order.shippingAddress} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted mb-1">Dirección de facturación</p>
              <AddressBlock addr={order.billingAddress} />
            </div>
          </div>
          {order.customerNote && (
            <div className="mt-3 p-3 bg-cream/40 rounded-xl text-xs text-text-muted">
              <span className="font-semibold">Nota: </span>{order.customerNote}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-5">
          <h2 className="font-semibold text-text-main text-sm mb-3">Totales</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-medium">{fmtCurrency(order.subtotalAmount, order.currency)}</span>
            </div>
            {order.shippingAmount != null && (
              <div className="flex justify-between">
                <span className="text-text-muted">Envío</span>
                <span>{fmtCurrency(order.shippingAmount, order.currency)}</span>
              </div>
            )}
            {order.taxAmount != null && (
              <div className="flex justify-between">
                <span className="text-text-muted">Impuestos</span>
                <span>{fmtCurrency(order.taxAmount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#E0DED9] font-bold">
              <span>Total</span>
              <span>{fmtCurrency(order.totalAmount, order.currency)}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {order.financialStatus && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${order.financialStatus === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {order.financialStatus}
              </span>
            )}
            {order.fulfillmentStatus && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {order.fulfillmentStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <h2 className="font-bold text-text-main text-base mb-3">Items ({order.items.length})</h2>
      <div className="space-y-3 mb-6">
        {order.items.map((item) => (
          <OrderItemCard
            key={item.id}
            item={item}
            orderId={id}
            currency={order.currency}
            onUpdate={load}
          />
        ))}
      </div>

      {/* Events timeline */}
      {order.events.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-5 mb-6">
          <h2 className="font-bold text-text-main text-base mb-4">Historial de eventos</h2>
          <div className="space-y-3">
            {order.events.map((ev) => (
              <div key={ev.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-main">
                    <span className="font-medium">{ev.eventType.replace(/_/g, " ")}</span>
                    {ev.fromStatus && ev.toStatus && (
                      <span className="text-text-muted"> · {PRODUCTION_STATUS_LABELS[ev.fromStatus] ?? ev.fromStatus} → {PRODUCTION_STATUS_LABELS[ev.toStatus] ?? ev.toStatus}</span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{fmtDate(ev.createdAt)} · {ev.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw payload */}
      <details className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
        <summary
          className="flex items-center gap-2 px-5 py-3 cursor-pointer text-sm font-semibold text-text-muted hover:bg-cream/30 transition-colors"
          onClick={() => setShowRaw((v) => !v)}
        >
          <span className="material-symbols-outlined text-[18px]">data_object</span>
          Payload de Shopify (JSON)
        </summary>
        {showRaw && (
          <pre className="px-5 pb-5 text-xs overflow-x-auto text-text-muted whitespace-pre-wrap">
            {JSON.stringify(order, null, 2)}
          </pre>
        )}
      </details>
    </div>
  );
}
