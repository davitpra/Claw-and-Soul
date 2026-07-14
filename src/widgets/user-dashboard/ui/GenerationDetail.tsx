"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { isNotFound } from "@/shared/lib/http";
import Accordion from "@/shared/ui/Accordion";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { ImageZoom } from "@/shared/ui/ImageZoom";
import {
  formatOrderDate,
  generationStatusBadge,
} from "@/entities/order/lib/presentation";
import type { ApiEnvelope, UserGenerationDetail } from "@/entities/order/types";

interface Props {
  id: string;
}

export function GenerationDetail({ id }: Props) {
  const { get, authFetchJSON, delete: del } = useAuthFetch();
  const router = useRouter();

  const [generation, setGeneration] = useState<UserGenerationDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await get<ApiEnvelope<UserGenerationDetail>>(
        `/generations/${id}`,
      );
      setGeneration(res.data ?? null);
      setIsFavorite(res.data?.isFavorite ?? false);
    } catch (err) {
      if (isNotFound(err)) setNotFound(true);
      else setError("Couldn't load this artwork. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = useCallback(async () => {
    if (savingFavorite) return;
    const next = !isFavorite;
    setIsFavorite(next); // optimista
    setSavingFavorite(true);
    try {
      await authFetchJSON(`/generations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
    } catch {
      setIsFavorite(!next); // revertir en fallo
    } finally {
      setSavingFavorite(false);
    }
  }, [authFetchJSON, id, isFavorite, savingFavorite]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await del(`/generations/${id}`);
      router.push("/user/generations");
    } catch {
      setDeleting(false);
      setDeleteError("Couldn't delete this artwork. Please try again.");
    }
  }, [del, id, router, deleting]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="aspect-4/5 w-full animate-pulse rounded-xl bg-cream" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="h-4 w-24 animate-pulse rounded bg-cream" />
          <div className="h-10 w-56 animate-pulse rounded-xl bg-cream" />
          <div className="h-4 w-40 animate-pulse rounded bg-cream" />
          <div className="mt-4 h-14 w-full animate-pulse rounded-full bg-cream" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-cream" />
        </div>
      </div>
    );
  }

  if (notFound || (!generation && !error)) {
    return (
      <section className="rounded-xl bg-white p-8 text-center md:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
          <span className="material-symbols-outlined text-[32px]">
            image_not_supported
          </span>
        </span>
        <h1 className="mt-4 font-display text-xl font-black text-text-main">
          Artwork not found
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          We couldn&apos;t find this artwork in your account.
        </p>
        <Link
          href="/user/generations"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to my artworks
        </Link>
      </section>
    );
  }

  if (error || !generation) {
    return (
      <section className="rounded-xl bg-white p-6 md:p-8">
        <BackLink />
        <div className="mt-5 flex flex-col items-center rounded-xl bg-red-50 px-4 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-[26px]">error</span>
          </span>
          <p className="mt-3 text-sm text-red-700">
            {error ?? "Couldn't load this artwork."}
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Retry
          </button>
        </div>
      </section>
    );
  }

  const status = generation.status;
  const badge = generationStatusBadge(status);
  const isReady = status === "completed";
  const isFailed = status === "failed";
  const imageUrl = generation.resultUrl ?? generation.thumbnailUrl;
  const petName = generation.pet?.name ?? "Your artwork";
  const styleName = generation.style?.displayName ?? generation.style?.category;

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        {/* IZQUIERDA — imagen flotante */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-center px-4 pt-4 pb-10 md:px-8">
            {isReady && imageUrl ? (
              <ImageZoom alt={petName}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={petName}
                  className="h-auto w-full bg-white shadow-[0_14px_32px_-12px_rgba(16,54,66,0.40)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]"
                />
              </ImageZoom>
            ) : isFailed ? (
              <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-3 rounded-xl bg-cream text-center text-text-muted">
                <span className="material-symbols-outlined text-[40px] text-red-500">
                  error
                </span>
                <p className="px-6 text-sm">
                  {generation.errorMessage ??
                    "This generation failed to complete."}
                </p>
              </div>
            ) : (
              <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-3 rounded-xl bg-cream text-center text-text-muted">
                <div className="size-10 animate-spin rounded-full border-b-2 border-primary" />
                <p className="text-sm">Your artwork is still being created…</p>
              </div>
            )}
          </div>
        </div>

        {/* DERECHA — panel sticky */}
        <div className="flex flex-col lg:col-span-5">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                AI Artwork
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-text-main lg:text-5xl">
                  {petName}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${badge.classes}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
                {styleName && (
                  <>
                    <span className="font-semibold text-text-main">
                      {styleName}
                    </span>
                    <span className="text-text-muted/50">·</span>
                  </>
                )}
                <span className="capitalize">{generation.type}</span>
                <span className="text-text-muted/50">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  {formatOrderDate(generation.createdAt)}
                </span>
              </p>
            </div>

            <div className="h-px w-full bg-text-main/10" />

            {(generation.prompt || generation.provider) && (
              <Accordion
                title="Details"
                className="rounded-xl"
                summaryClassName="py-1"
                titleClassName="font-display text-lg font-black text-text-main"
                iconClassName="text-text-muted"
                contentClassName="pt-3 flex flex-col gap-3 text-sm text-text-muted"
              >
                {generation.prompt && (
                  <div>
                    <p className="font-bold text-text-main">Prompt</p>
                    <p className="mt-1 leading-relaxed">{generation.prompt}</p>
                  </div>
                )}
                {generation.provider && (
                  <div>
                    <p className="font-bold text-text-main">Provider</p>
                    <p className="mt-1 capitalize">{generation.provider}</p>
                  </div>
                )}
              </Accordion>
            )}

            <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />

            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Do more with this
            </span>

            {/* CTA primario — Ordenar como print */}
            <Link
              href="/shop"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[22px]">
                print
              </span>
              Order as a print
            </Link>

            <div className="flex flex-wrap gap-3">
              {/* Favorito */}
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={savingFavorite}
                aria-pressed={isFavorite}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-5 py-3 text-sm font-bold text-text-main shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-60"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isFavorite ? "text-primary" : ""
                  }`}
                  style={
                    isFavorite
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  favorite
                </span>
                {isFavorite ? "Favorited" : "Favorite"}
              </button>

              {/* Enviar a PBN */}
              {isReady && imageUrl && (
                <Link
                  href={`/paint-by-numbers?generationId=${generation.id}&imageUrl=${encodeURIComponent(imageUrl)}${generation.style?.id ? `&styleId=${generation.style.id}` : ""}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-5 py-3 text-sm font-bold text-text-main shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    format_paint
                  </span>
                  Send to PBN
                </Link>
              )}
            </div>

            {/* Borrar */}
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmingDelete(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 self-center rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete artwork
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this artwork?"
        description="This action can't be undone."
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setConfirmingDelete(false);
        }}
      >
        {isReady && imageUrl && (
          <div
            className="aspect-4/5 w-full rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />
        )}
      </ConfirmDialog>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/user/generations"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted transition-colors hover:text-primary"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      Back to my artworks
    </Link>
  );
}
