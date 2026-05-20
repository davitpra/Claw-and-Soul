"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  adminApi,
  AdminOrderListItem,
  Paginated,
} from "@/entities/admin/api";

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getOrderStatus(items: AdminOrderListItem["items"]): string {
  if (!items.length) return "paid";
  const statuses = [...new Set(items.map((i) => i.productionStatus))];
  return statuses.length === 1 ? statuses[0] : "mixed";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "mixed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Mixto
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {PRODUCTION_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ItemThumbnails({ items }: { items: AdminOrderListItem["items"] }) {
  const thumbs = items
    .slice(0, 3)
    .map((i) => i.generation?.resultUrl ?? i.imageUrl)
    .filter(Boolean) as string[];

  if (!thumbs.length) return <span className="text-text-muted text-xs">{items.length} item(s)</span>;

  return (
    <div className="flex items-center gap-1">
      {thumbs.map((url, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx}
          src={url}
          alt=""
          className="w-8 h-8 rounded-lg object-cover border border-[#E0DED9]"
        />
      ))}
      {items.length > 3 && (
        <span className="text-xs text-text-muted ml-1">+{items.length - 3}</span>
      )}
    </div>
  );
}

const STATUSES = ["paid", "in_production", "shipped", "delivered", "cancelled", "refunded"];
const METHODS = [
  { value: "", label: "Todos" },
  { value: "in_house", label: "Taller" },
  { value: "pod", label: "POD" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Paginated<AdminOrderListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [inputQ, setInputQ] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders.list({ page, q: q || undefined, status: status || undefined, method: method || undefined });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [page, q, status, method]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(inputQ.trim());
    setPage(1);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await adminApi.orders.triggerSync();
      setSyncMsg(`Sincronización iniciada (ID: ${res.syncId})`);
      setTimeout(() => load(), 3000);
    } catch (err) {
      setSyncMsg(`Error: ${(err as Error).message}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Pedidos</h1>
          <p className="text-sm text-text-muted mt-0.5">Gestión de pedidos y fabricación</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>sync</span>
          {syncing ? "Sincronizando…" : "Sincronizar desde Shopify"}
        </button>
      </div>

      {syncMsg && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm">
          {syncMsg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Buscar # pedido o email…"
            className="flex-1 border border-[#E0DED9] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </form>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { setStatus(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!status ? "bg-primary text-white border-primary" : "border-[#E0DED9] text-text-muted hover:bg-cream"}`}
          >
            Todos
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${status === s ? "bg-primary text-white border-primary" : "border-[#E0DED9] text-text-muted hover:bg-cream"}`}
            >
              {PRODUCTION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); setPage(1); }}
          className="border border-[#E0DED9] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text-muted">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Cargando pedidos…
          </div>
        ) : !orders?.data.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
            <span className="material-symbols-outlined text-4xl">shopping_bag</span>
            <p className="text-sm">No hay pedidos con estos filtros</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DED9] bg-cream/40">
                  <th className="text-left px-4 py-3 font-semibold text-text-muted"># Pedido</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted">Items</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted">Estado prod.</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.data.map((order) => {
                  const orderStatus = getOrderStatus(order.items);
                  return (
                    <tr key={order.id} className="border-b border-[#E0DED9] hover:bg-cream/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-text-main">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        {order.userId ? (
                          <Link href={`/admin/users/${order.userId}`} className="text-primary hover:underline text-sm">
                            {order.customerName || order.customerEmail || "—"}
                          </Link>
                        ) : (
                          <span className="text-text-muted text-sm">{order.customerEmail || "Invitado"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ItemThumbnails items={order.items} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-main">
                        {fmtCurrency(order.totalAmount, order.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={orderStatus} />
                      </td>
                      <td className="px-4 py-3 text-text-muted">{fmtDate(order.shopifyCreatedAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-cream transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px] text-text-muted">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E0DED9]">
              <p className="text-sm text-text-muted">
                {orders.meta.total} pedido(s) · Página {orders.meta.page} de {orders.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  Anterior
                </button>
                <button
                  disabled={page >= orders.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 transition-colors text-sm"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
