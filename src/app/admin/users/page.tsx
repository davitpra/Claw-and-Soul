"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminApi, AdminUserListItem, Paginated } from "@/entities/admin/api";

const LOCATION_PLACEHOLDERS = [
  "Buenos Aires, AR",
  "Córdoba, AR",
  "Rosario, AR",
  "La Plata, AR",
  "Mendoza, AR",
  "Mar del Plata, AR",
  "Santiago, CL",
  "Montevideo, UY",
];

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getHandle(email: string): string {
  return "@" + email.split("@")[0];
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminUsersPage() {
  const [result, setResult] = useState<Paginated<AdminUserListItem> | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((p: number, s: string) => {
    adminApi.users
      .list(p, s || undefined)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    setSearch(searchInput);
  };

  const handlePage = (p: number) => {
    setPage(p);
    setLoading(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
          Usuarios
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Usuarios registrados en la plataforma
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-[#E0DED9] shadow-sm overflow-hidden">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-dark font-display">
              Usuarios logeados
            </h2>
            {result && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {result.meta.total} en total
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar usuario…"
                  className="h-9 w-52 rounded-xl border border-[#E0DED9] pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-[#f7f6f2]"
                />
              </div>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                    setLoading(true);
                  }}
                  className="text-xs text-text-muted hover:text-slate-dark px-2 py-1 rounded-lg hover:bg-[#f7f6f2] transition-colors"
                >
                  Limpiar
                </button>
              )}
            </form>
            <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#E0DED9] text-sm font-semibold text-text-muted hover:bg-[#f7f6f2] transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                tune
              </span>
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DED9] bg-[#f7f6f2]">
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Usuario
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Correo
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Ubicación
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Mascotas
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Generaciones
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Última actividad
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-text-muted text-sm"
                  >
                    <span className="material-symbols-outlined animate-spin text-primary text-xl align-middle mr-2">
                      progress_activity
                    </span>
                    Cargando usuarios…
                  </td>
                </tr>
              ) : result?.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-text-muted text-sm"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                result?.data.map((u, i) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#E0DED9] last:border-0 hover:bg-[#f7f6f2]/60 transition-colors"
                  >
                    {/* Usuario */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-primary/20 text-primary`}
                        >
                          {getInitials(u.fullName, u.email)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-main leading-tight">
                            {u.fullName || getHandle(u.email)}
                          </p>
                          <p className="text-xs text-text-muted">
                            {getHandle(u.email)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Correo */}
                    <td className="px-5 py-3.5 text-text-muted">{u.email}</td>
                    {/* Ubicación — placeholder */}
                    <td className="px-5 py-3.5 text-text-muted text-sm">
                      {LOCATION_PLACEHOLDERS[i % LOCATION_PLACEHOLDERS.length]}
                    </td>
                    {/* Mascotas */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-text-main font-medium">
                        {u._count.pets}
                      </div>
                    </td>
                    {/* Generaciones */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-text-main font-medium">
                        {u._count.generations}
                      </div>
                    </td>
                    {/* Última actividad */}
                    <td className="px-5 py-3.5 text-text-muted text-sm">
                      {relativeTime(u.lastLoginAt)}
                    </td>
                    {/* Ver */}
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Ver
                        <span className="material-symbols-outlined text-[14px]">
                          chevron_right
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {result && result.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E0DED9] bg-[#f7f6f2]">
            <p className="text-xs text-text-muted">
              Mostrando {(result.meta.page - 1) * result.meta.limit + 1}–
              {Math.min(
                result.meta.page * result.meta.limit,
                result.meta.total,
              )}{" "}
              de {result.meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => handlePage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0DED9] text-text-muted hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>
              {Array.from(
                { length: Math.min(result.meta.totalPages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-primary text-white"
                      : "border border-[#E0DED9] text-text-muted hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= result.meta.totalPages}
                onClick={() => handlePage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0DED9] text-text-muted hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
