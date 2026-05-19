"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminApi, AdminStyle } from "@/entities/admin/api";

export default function AdminStylesPage() {
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.styles
      .list()
      .then(setStyles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (style: AdminStyle) => {
    setToggling(style.id);
    try {
      if (style.isActive) {
        await adminApi.styles.deactivate(style.id);
      } else {
        await adminApi.styles.update(style.id, { isActive: true });
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
          Estilos
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Gestiona el catálogo de estilos de IA
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
          Cargando estilos…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DED9] bg-cream">
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Vista previa</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Categoría</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Imágenes</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted">Acción</th>
                </tr>
              </thead>
              <tbody>
                {styles.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-[#E0DED9] last:border-0 transition-colors ${
                      s.isActive ? "hover:bg-cream/50" : "bg-gray-50/50 opacity-60"
                    }`}
                  >
                    <td className="px-5 py-3">
                      {s.previewUrl ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-[#E0DED9]">
                          <Image
                            src={s.previewUrl}
                            alt={s.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-cream border border-[#E0DED9] flex items-center justify-center">
                          <span className="material-symbols-outlined text-text-muted text-[18px]">
                            image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-text-main">{s.displayName}</p>
                      <p className="text-xs text-text-muted">{s.name}</p>
                    </td>
                    <td className="px-5 py-3 text-text-muted capitalize">{s.category}</td>
                    <td className="px-5 py-3 text-text-muted">{s.images.length}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {s.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        disabled={toggling === s.id}
                        onClick={() => handleToggle(s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          s.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {toggling === s.id
                          ? "..."
                          : s.isActive
                          ? "Desactivar"
                          : "Activar"}
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
