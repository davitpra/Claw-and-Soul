"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminFormat } from "@/entities/admin/api";

export default function AdminFormatsPage() {
  const [formats, setFormats] = useState<AdminFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.formats
      .list()
      .then((res: unknown) => {
        const data = (res as { data?: AdminFormat[] })?.data ?? (res as AdminFormat[]);
        setFormats(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (f: AdminFormat) => {
    setToggling(f.id);
    try {
      if (f.isActive) {
        await adminApi.formats.deactivate(f.id);
      } else {
        await adminApi.formats.update(f.id, { isActive: true });
      }
      load();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
          Formatos
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Dimensiones y proporciones de salida
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-text-muted">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando formatos…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DED9] bg-cream">
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Proporción</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Dimensiones</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Opción Shopify</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Acción</th>
                </tr>
              </thead>
              <tbody>
                {formats.map((f) => (
                  <tr
                    key={f.id}
                    className={`border-b border-[#E0DED9] last:border-0 transition-colors ${
                      f.isActive ? "hover:bg-cream/50" : "bg-gray-50/50 opacity-60"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-text-main">{f.displayName}</p>
                      <p className="text-xs text-text-muted">{f.name}</p>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{f.aspectRatio}</td>
                    <td className="px-5 py-3 text-text-muted">
                      {f.width} × {f.height}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {f.shopifyVariantOption ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          f.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {f.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        disabled={toggling === f.id}
                        onClick={() => handleToggle(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          f.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {toggling === f.id ? "..." : f.isActive ? "Desactivar" : "Activar"}
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
