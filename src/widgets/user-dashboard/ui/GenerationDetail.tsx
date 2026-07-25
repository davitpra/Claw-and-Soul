"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Accordion from "@/shared/ui/Accordion";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DetailErrorState } from "@/shared/ui/DetailErrorState";
import { DetailNotFound } from "@/shared/ui/DetailNotFound";
import { useGenerationDetail } from "@/entities/order/api/useGenerationDetail";
import { BackToGenerationsLink } from "@/entities/order/ui/BackToGenerationsLink";
import { GenerationImage } from "@/entities/order/ui/GenerationImage";
import { GenerationStatusBadge } from "@/entities/order/ui/GenerationStatusBadge";
import { formatOrderDate } from "@/entities/order/lib/presentation";

interface Props {
  id: string;
}

export function GenerationDetail({ id }: Props) {
  const router = useRouter();
  const {
    generation,
    isLoading,
    error,
    notFound,
    reload,
    isFavorite,
    savingFavorite,
    toggleFavorite,
    deleting,
    deleteError,
    deleteGeneration,
  } = useGenerationDetail(id);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleDelete() {
    const ok = await deleteGeneration();
    if (ok) router.push("/user/generations");
  }

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
      <DetailNotFound
        icon="image_not_supported"
        title="Artwork not found"
        message="We couldn't find this artwork in your account."
        backHref="/user/generations"
        backLabel="Back to my artworks"
      />
    );
  }

  if (error || !generation) {
    return (
      <DetailErrorState
        back={<BackToGenerationsLink />}
        message={error ?? "Couldn't load this artwork."}
        onRetry={reload}
      />
    );
  }

  const status = generation.status;
  const isReady = status === "completed";
  const imageUrl = generation.resultUrl ?? generation.thumbnailUrl;
  const petName = generation.pet?.name ?? "Your artwork";
  const styleName = generation.style?.displayName ?? generation.style?.category;

  return (
    <div className="flex flex-col gap-6">
      <BackToGenerationsLink />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        {/* IZQUIERDA — imagen flotante */}
        <div className="lg:col-span-7">
          <GenerationImage
            status={status}
            imageUrl={imageUrl}
            errorMessage={generation.errorMessage}
            alt={petName}
          />
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
                <GenerationStatusBadge status={status} />
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
              href="/catalog"
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
                    isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined
                  }
                >
                  favorite
                </span>
                {isFavorite ? "Favorited" : "Favorite"}
              </button>

              {/* Enviar a PBN */}
              {isReady && imageUrl && (
                <Link
                  href={`/studio?generationId=${generation.id}&imageUrl=${encodeURIComponent(imageUrl)}${generation.style?.id ? `&styleId=${generation.style.id}` : ""}`}
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
              onClick={() => setConfirmingDelete(true)}
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
