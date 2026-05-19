"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  adminApi,
  AdminUserDetail,
  AdminUserGeneration,
  Paginated,
} from "@/entities/admin/api";

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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [gens, setGens] = useState<Paginated<AdminUserGeneration> | null>(null);
  const [genPage, setGenPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gensLoading, setGensLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
        <span className="material-symbols-outlined">error</span>
        {error ?? "Usuario no encontrado"}
      </div>
    );
  }

  const allPhotos = user.pets.flatMap((p) =>
    p.photos.map((ph) => ({ ...ph, petName: p.name, petSpecies: p.species }))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Back */}
      <Link
        href="/admin/users"
        className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        Volver a usuarios
      </Link>

      {/* User info card */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] p-6 shadow-sm flex flex-col sm:flex-row gap-6">
        <div className="flex items-center justify-center sm:items-start">
          <div className="bg-primary/10 rounded-2xl p-4">
            <span className="material-symbols-outlined text-primary text-4xl">
              account_circle
            </span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Nombre</p>
            <p className="font-semibold text-text-main">
              {user.fullName || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Email</p>
            <p className="font-semibold text-text-main">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Rol</p>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                ROLE_BADGE[user.role] ?? "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {user.role}
            </span>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Estado</p>
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
          <div>
            <p className="text-xs text-text-muted mb-0.5">Registro</p>
            <p className="font-semibold text-text-main">{fmtDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Último acceso</p>
            <p className="font-semibold text-text-main">
              {user.lastLoginAt ? fmtDate(user.lastLoginAt) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Email verificado</p>
            <p className="font-semibold text-text-main">
              {user.emailVerified ? "Sí" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Mascotas</p>
            <p className="font-semibold text-text-main">{user.pets.length}</p>
          </div>
        </div>
      </div>

      {/* Pet photos */}
      <div>
        <h2 className="text-lg font-bold text-slate-dark font-display mb-4">
          Fotografías de mascotas
          <span className="text-sm font-normal text-text-muted ml-2">
            ({allPhotos.length} fotos)
          </span>
        </h2>
        {user.pets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
            Este usuario no tiene mascotas registradas.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {user.pets.map((pet) => (
              <div key={pet.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    pets
                  </span>
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
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                    {pet.photos.map((ph) => (
                      <div
                        key={ph.id}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          ph.isPrimary
                            ? "border-primary shadow-md"
                            : "border-[#E0DED9]"
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
            ))}
          </div>
        )}
      </div>

      {/* Generations */}
      <div>
        <h2 className="text-lg font-bold text-slate-dark font-display mb-4">
          Generaciones de IA
          {gens && (
            <span className="text-sm font-normal text-text-muted ml-2">
              ({gens.meta.total} en total)
            </span>
          )}
        </h2>
        {gensLoading ? (
          <div className="flex items-center gap-3 text-text-muted">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Cargando generaciones…
          </div>
        ) : !gens || gens.data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E0DED9] p-8 text-center text-text-muted text-sm shadow-sm">
            Este usuario no tiene generaciones.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {gens.data.map((g) => {
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
                      <p className="text-xs text-text-muted truncate">
                        {g.pet?.name ?? "—"}
                      </p>
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

            {gens.meta.totalPages > 1 && (
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
          </>
        )}
      </div>
    </div>
  );
}
