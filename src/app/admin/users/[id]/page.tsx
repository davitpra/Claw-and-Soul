"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  adminApi,
  AdminUserDetail,
  AdminUserGeneration,
  AdminUserOrderListItem,
  Paginated,
} from "@/entities/admin/api";
import Breadcrumbs from "@/shared/ui/Breadcrumbs";

const LOCATION_PLACEHOLDERS = [
  "Buenos Aires, Argentina",
  "Córdoba, Argentina",
  "Rosario, Argentina",
  "La Plata, Argentina",
  "Mendoza, Argentina",
  "Mar del Plata, Argentina",
  "Santiago, Chile",
  "Montevideo, Uruguay",
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

function getLocation(id: string): string {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return LOCATION_PLACEHOLDERS[sum % LOCATION_PLACEHOLDERS.length];
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-100",
  premium: "bg-amber-50 text-amber-700 border-amber-100",
  user: "bg-blue-50 text-blue-700 border-blue-100",
};

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  processing: "bg-amber-50 text-amber-700",
  pending: "bg-gray-50 text-gray-500",
};

type Tab = "resumen" | "mascotas" | "imagenes" | "ia" | "pedidos";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "mascotas", label: "Mascotas" },
  { id: "imagenes", label: "Imágenes" },
  { id: "ia", label: "Resultados IA" },
  { id: "pedidos", label: "Pedidos" },
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [gens, setGens] = useState<Paginated<AdminUserGeneration> | null>(null);
  const [genPage, setGenPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gensLoading, setGensLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");

  useEffect(() => {
    adminApi.users
      .detail(id)
      .then(setUser)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setGensLoading(true);
    adminApi.users
      .generations(id, genPage)
      .then(setGens)
      .catch(() => {})
      .finally(() => setGensLoading(false));
  }, [id, genPage]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-text-muted">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Cargando usuario…
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-2xl p-4 text-sm">
        <span className="material-symbols-outlined">error</span>
        {error ?? "Usuario no encontrado"}
      </div>
    );
  }

  const allPhotos = user.pets.flatMap((p) =>
    p.photos.map((ph) => ({ ...ph, petName: p.name, petSpecies: p.species }))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Usuarios", href: "/admin/users" },
          { label: "Perfil" },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark font-display tracking-tight">
            Perfil de usuario
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Información y actividad del usuario
          </p>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center gap-1 text-sm font-semibold text-text-muted border border-[#E0DED9] rounded-xl px-4 py-2 hover:bg-cream transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          Volver a usuarios
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] p-6 shadow-sm flex flex-col gap-6">
        {/* Identity row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold font-display select-none">
              {getInitials(user.fullName, user.email)}
            </div>
            {user.isActive && (
              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <p className="text-xl font-bold text-slate-dark font-display leading-tight">
                {user.fullName || getHandle(user.email)}
              </p>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                  ROLE_BADGE[user.role] ?? "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  user.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {user.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="text-sm text-text-muted">{getHandle(user.email)}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {getLocation(user.id)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  {user.emailVerified ? "mark_email_read" : "mail"}
                </span>
                Email {user.emailVerified ? "verificado" : "no verificado"}
              </span>
              {user.lastLoginAt && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Último acceso: {fmtDate(user.lastLoginAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "pets", label: "Mascotas", value: user.pets.length },
            { icon: "photo_library", label: "Imágenes subidas", value: allPhotos.length },
            {
              icon: "auto_awesome",
              label: "Resultados IA",
              value: gens?.meta.total ?? "—",
            },
            {
              icon: "calendar_today",
              label: "Días desde alta",
              value: daysSince(user.createdAt),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-2 bg-[#f7f6f2] rounded-xl p-4 text-center"
            >
              <div className="bg-primary/10 rounded-xl p-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {s.icon}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-dark font-display leading-none">
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
              </p>
              <p className="text-xs text-text-muted font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E0DED9]">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "text-primary border-primary"
                  : "text-text-muted border-transparent hover:text-text-main"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "resumen" && (
        <div className="flex flex-col gap-8">
          {/* Photos preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-dark font-display">
                Fotos de mascotas subidas
                <span className="text-sm font-normal text-text-muted ml-2">
                  ({allPhotos.length} fotos)
                </span>
              </h2>
              {allPhotos.length > 9 && (
                <button
                  onClick={() => setTab("imagenes")}
                  className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-0.5"
                >
                  Ver todas las imágenes
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              )}
            </div>
            {allPhotos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
                Este usuario no tiene fotos subidas.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {allPhotos.slice(0, 9).map((ph) => (
                  <div
                    key={ph.id}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      ph.isPrimary ? "border-primary shadow-md" : "border-[#E0DED9]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ph.photoUrl}
                      alt={ph.petName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {ph.isPrimary && (
                      <div className="absolute top-1 left-1 bg-primary rounded-full p-0.5">
                        <span className="material-symbols-outlined text-white text-[10px] block">
                          star
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generations preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-dark font-display">
                Resultados IA generados
                {gens && (
                  <span className="text-sm font-normal text-text-muted ml-2">
                    ({gens.meta.total} en total)
                  </span>
                )}
              </h2>
              {gens && gens.meta.total > 6 && (
                <button
                  onClick={() => setTab("ia")}
                  className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-0.5"
                >
                  Ver todos los resultados
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              )}
            </div>
            <GenerationsGrid gens={gens} loading={gensLoading} preview={6} />
          </div>
        </div>
      )}

      {tab === "mascotas" && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-dark font-display">
            Mascotas
            <span className="text-sm font-normal text-text-muted ml-2">
              ({user.pets.length})
            </span>
          </h2>
          {user.pets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
              Este usuario no tiene mascotas registradas.
            </div>
          ) : (
            user.pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-2xl border border-[#E0DED9] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">pets</span>
                  <p className="text-sm font-semibold text-text-main capitalize">
                    {pet.name}
                    <span className="text-text-muted font-normal ml-1">
                      · {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </span>
                  </p>
                  {!pet.isActive && (
                    <span className="text-xs text-gray-400">(inactiva)</span>
                  )}
                </div>
                {pet.photos.length === 0 ? (
                  <p className="text-xs text-text-muted ml-6">Sin fotos subidas.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                    {pet.photos.map((ph) => (
                      <div
                        key={ph.id}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          ph.isPrimary ? "border-primary shadow-md" : "border-[#E0DED9]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ph.photoUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {ph.isPrimary && (
                          <div className="absolute top-1 left-1 bg-primary rounded-full p-0.5">
                            <span className="material-symbols-outlined text-white text-[10px] block">
                              star
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "imagenes" && (
        <div>
          <h2 className="text-lg font-bold text-slate-dark font-display mb-4">
            Imágenes subidas
            <span className="text-sm font-normal text-text-muted ml-2">
              ({allPhotos.length} fotos)
            </span>
          </h2>
          {allPhotos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
              Este usuario no tiene fotos subidas.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
              {allPhotos.map((ph) => (
                <div
                  key={ph.id}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    ph.isPrimary ? "border-primary shadow-md" : "border-[#E0DED9]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.photoUrl}
                    alt={ph.petName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {ph.isPrimary && (
                    <div className="absolute top-1 left-1 bg-primary rounded-full p-0.5">
                      <span className="material-symbols-outlined text-white text-[10px] block">
                        star
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {ph.petName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "ia" && (
        <div>
          <h2 className="text-lg font-bold text-slate-dark font-display mb-4">
            Resultados IA generados
            {gens && (
              <span className="text-sm font-normal text-text-muted ml-2">
                ({gens.meta.total} en total)
              </span>
            )}
          </h2>
          <GenerationsGrid gens={gens} loading={gensLoading} />
          {gens && gens.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-text-muted">
                Página {gens.meta.page} de {gens.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={genPage <= 1}
                  onClick={() => setGenPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  Anterior
                </button>
                <button
                  disabled={genPage >= gens.meta.totalPages}
                  onClick={() => setGenPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] text-text-main hover:bg-cream disabled:opacity-40 transition-colors"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "pedidos" && (
        <UserOrdersList userId={id} />
      )}
    </div>
  );
}

function GenerationsGrid({
  gens,
  loading,
  preview,
}: {
  gens: Paginated<AdminUserGeneration> | null;
  loading: boolean;
  preview?: number;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-text-muted">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Cargando generaciones…
      </div>
    );
  }

  const items = preview ? gens?.data.slice(0, preview) : gens?.data;

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
        Este usuario no tiene generaciones.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((g) => {
        const imgUrl = g.thumbnailUrl ?? g.resultUrl;
        return (
          <div
            key={g.id}
            className="flex flex-col bg-white rounded-2xl border border-[#E0DED9] overflow-hidden shadow-sm"
          >
            <div className="relative aspect-square bg-cream">
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt={g.style?.displayName ?? "Generación"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-text-muted text-3xl">
                    {g.status === "failed" ? "broken_image" : "hourglass_top"}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs text-text-muted truncate">
                {g.style?.displayName ?? "—"}
              </p>
              <p className="text-xs text-text-muted truncate">{g.pet?.name ?? "—"}</p>
              <span
                className={`mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  STATUS_BADGE[g.status] ?? "bg-gray-50 text-gray-500"
                }`}
              >
                {g.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function UserOrdersList({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Paginated<AdminUserOrderListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.users.orders(userId, page).then(setOrders).finally(() => setLoading(false));
  }, [userId, page]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-text-muted">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Cargando pedidos…
      </div>
    );
  }

  if (!orders?.data.length) {
    return (
      <div className="bg-white rounded-2xl border border-[#E0DED9] p-12 text-center shadow-sm flex flex-col items-center gap-3">
        <div className="bg-gray-100 rounded-2xl p-4">
          <span className="material-symbols-outlined text-gray-400 text-4xl">shopping_bag</span>
        </div>
        <p className="text-sm font-semibold text-text-main">Sin pedidos registrados</p>
        <p className="text-xs text-text-muted">No se encontraron pedidos para este usuario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.data.map((order) => {
        const thumb = order.items[0]?.generation?.resultUrl ?? order.items[0]?.imageUrl;
        return (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-4 hover:bg-cream/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl border border-[#E0DED9] overflow-hidden bg-cream/40 shrink-0">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-text-muted text-xl">image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-main text-sm font-mono">{order.orderNumber}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(order.shopifyCreatedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })} · {order.items.length} item(s)
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-text-main text-sm">
                {new Intl.NumberFormat("es-ES", { style: "currency", currency: order.currency }).format(order.totalAmount)}
              </p>
              <div className="flex justify-end gap-1 mt-1 flex-wrap">
                {[...new Set(order.items.map((i) => i.productionStatus))].map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-cream text-text-muted font-medium">
                    {PRODUCTION_STATUS_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
            <span className="material-symbols-outlined text-text-muted text-[20px]">chevron_right</span>
          </Link>
        );
      })}
      {orders.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-[#E0DED9] text-sm text-text-muted hover:bg-cream disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <button
            disabled={page >= orders.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-[#E0DED9] text-sm text-text-muted hover:bg-cream disabled:opacity-40 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
