"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminProduct, SyncStatus } from "@/entities/admin/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    adminApi.products
      .list()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const loadSyncStatus = () => {
    adminApi.sync.status().then(setSyncStatus).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    loadSyncStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await adminApi.sync.trigger();
      await new Promise((r) => setTimeout(r, 1500));
      loadSyncStatus();
      loadProducts();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggle = async (p: AdminProduct) => {
    setToggling(p.id);
    try {
      if (p.isActive) {
        await adminApi.products.deactivate(p.id);
      } else {
        await adminApi.products.update(p.id, { isActive: true });
      }
      loadProducts();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
            Productos & Sync
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Productos sincronizados desde Shopify
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>
            sync
          </span>
          {syncing ? "Sincronizando…" : "Sincronizar Shopify"}
        </button>
      </div>

      {/* Sync status */}
      {syncStatus && (
        <div className="bg-white rounded-2xl border border-[#E0DED9] p-5 shadow-sm flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-text-muted mb-1">Último estado</p>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                syncStatus.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : syncStatus.status === "failed"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {syncStatus.status}
            </span>
          </div>
          {syncStatus.startedAt && (
            <div>
              <p className="text-xs text-text-muted mb-1">Iniciado</p>
              <p className="font-semibold text-text-main">
                {new Date(syncStatus.startedAt).toLocaleString("es-ES")}
              </p>
            </div>
          )}
          {syncStatus.productsChecked != null && (
            <div>
              <p className="text-xs text-text-muted mb-1">Revisados</p>
              <p className="font-semibold text-text-main">{syncStatus.productsChecked}</p>
            </div>
          )}
          {syncStatus.productsCreated != null && (
            <div>
              <p className="text-xs text-text-muted mb-1">Creados</p>
              <p className="font-semibold text-emerald-700">{syncStatus.productsCreated}</p>
            </div>
          )}
          {syncStatus.productsUpdated != null && (
            <div>
              <p className="text-xs text-text-muted mb-1">Actualizados</p>
              <p className="font-semibold text-text-main">{syncStatus.productsUpdated}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-text-muted">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando productos…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DED9] bg-cream">
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Producto</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Handle Shopify</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Estilo asignado</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Acción</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[#E0DED9] last:border-0 transition-colors ${
                      p.isActive ? "hover:bg-cream/50" : "bg-gray-50/50 opacity-60"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-text-main">{p.displayName}</p>
                      <p className="text-xs text-text-muted">{p.name}</p>
                    </td>
                    <td className="px-5 py-3 text-text-muted text-xs font-mono">
                      {p.shopifyHandle ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {p.style ? (
                        <span className="text-text-main font-medium">{p.style.displayName}</span>
                      ) : (
                        <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {p.productType?.displayName ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        disabled={toggling === p.id}
                        onClick={() => handleToggle(p)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          p.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {toggling === p.id ? "..." : p.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
