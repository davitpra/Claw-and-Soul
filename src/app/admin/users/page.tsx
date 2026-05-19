"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminApi, AdminUserListItem, Paginated } from "@/entities/admin/api";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-100",
  premium: "bg-amber-50 text-amber-700 border-amber-100",
  user: "bg-blue-50 text-blue-700 border-blue-100",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [result, setResult] = useState<Paginated<AdminUserListItem> | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((p: number, s: string) => {
    setLoading(true);
    adminApi.users
      .list(p, s || undefined)
      .then(setResult)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
          Usuarios
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Usuarios registrados en la plataforma
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por email o nombre…"
            className="w-full h-10 rounded-xl border border-[#E0DED9] pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 h-10 text-sm font-semibold transition-colors"
        >
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="text-text-muted hover:text-slate-dark text-sm px-3 h-10 rounded-xl hover:bg-cream transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-text-muted">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando usuarios…
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0DED9] bg-cream">
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Usuario</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Rol</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Mascotas</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Generaciones</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Registro</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Último acceso</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted">Estado</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-muted"></th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-text-muted text-sm">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                  {result?.data.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[#E0DED9] last:border-0 hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-text-main">
                          {u.fullName || "—"}
                        </p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                            ROLE_BADGE[u.role] ?? "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-main font-medium">
                        {u._count.pets}
                      </td>
                      <td className="px-5 py-3 text-text-main font-medium">
                        {u._count.generations}
                      </td>
                      <td className="px-5 py-3 text-text-muted">
                        {fmtDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-text-muted">
                        {u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {u.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                        >
                          Ver
                          <span className="material-symbols-outlined text-[14px]">
                            chevron_right
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {result && result.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-text-muted">
                {result.meta.total} usuario{result.meta.total !== 1 ? "s" : ""} ·
                Página {result.meta.page} de {result.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  Anterior
                </button>
                <button
                  disabled={page >= result.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
