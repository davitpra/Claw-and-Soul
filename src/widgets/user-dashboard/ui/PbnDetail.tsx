"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DetailErrorState } from "@/shared/ui/DetailErrorState";
import { DetailNotFound } from "@/shared/ui/DetailNotFound";
import { Carousel } from "@/shared/ui/Carousel";
import ImageCompareSlider from "@/shared/ui/ImageCompareSlider";
import { cloudinaryDownloadUrl } from "@/shared/lib/cloudinary";
import { slugify } from "@/shared/lib/slug";
import { usePbnDetail } from "@/entities/order/api/usePbnDetail";
import { BackToPbnLink } from "@/entities/order/ui/BackToPbnLink";
import { formatOrderDate } from "@/entities/order/lib/presentation";
import {
  AccessoryUpsell,
  PbnPurchaseCard,
  usePbnAccessories,
} from "@/features/pbn-purchase";
import type { RGB } from "@/lib/pbn/common";

interface Props {
  id: string;
}

const swatch = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

/**
 * Ficha de un Paint-by-Numbers guardado. Espeja `GenerationDetail`: comparador
 * original ↔ resultado a la izquierda, ficha + acciones + cross-sell a la
 * derecha.
 */
export function PbnDetail({ id }: Props) {
  const router = useRouter();
  const { pbn, isLoading, error, notFound, reload, deleting, deleteError, deletePbn } =
    usePbnDetail(id);
  // Va antes de los early returns por las reglas de hooks. Aquí siempre se
  // vende el kit, así que no hace falta condicionar el `enabled`.
  const {
    accessories,
    loading: accessoriesLoading,
    bundlePercent,
  } = usePbnAccessories();

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // El PBN ya está persistido, así que "asegurar guardado" es devolver su
  // referencia: `PbnPurchaseCard` no necesita otro tipo de source.
  const pbnId = pbn?.id;
  const previewUrl = pbn?.previewUrl ?? null;
  const ensureSaved = useCallback(
    async () => (pbnId ? { id: pbnId, previewUrl } : null),
    [pbnId, previewUrl],
  );

  async function handleDelete() {
    const ok = await deletePbn();
    if (ok) router.push("/user/pbn");
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
          <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-cream" />
          <div className="grid grid-cols-1 gap-3">
            <div className="h-12 w-full animate-pulse rounded-xl bg-cream" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-cream" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!pbn && !error)) {
    return (
      <DetailNotFound
        icon="format_paint"
        title="Paint by Numbers not found"
        message="We couldn't find this Paint by Numbers in your account."
        backHref="/user/pbn"
        backLabel="Back to my Paint by Numbers"
      />
    );
  }

  if (error || !pbn) {
    return (
      <DetailErrorState
        back={<BackToPbnLink />}
        message={error ?? "Couldn't load this Paint by Numbers."}
        onRetry={reload}
      />
    );
  }

  const styleName =
    pbn.generation?.style?.displayName ?? pbn.generation?.style?.category;
  // Los PBNs guardados antes de heredar el pet de la generación tienen `petId`
  // nulo, así que la mascota se resuelve por la generación de origen.
  const petName = pbn.pet?.name ?? pbn.generation?.pet?.name;
  const title = petName ?? styleName ?? "Paint by Numbers";
  // `config` es una columna Json libre, así que la paleta se valida en runtime
  // (los PBN guardados desde el admin pueden no traerla).
  const palette: RGB[] = Array.isArray(pbn.config?.palette)
    ? pbn.config.palette.filter((c) => Array.isArray(c) && c.length >= 3)
    : [];
  const isOrdered = pbn.status === "ordered";
  // `<style>-<pet>`, con los mismos criterios que la descarga de una obra.
  const downloadBase =
    [styleName, petName]
      .map((part) => (part ? slugify(part) : ""))
      .filter(Boolean)
      .join("-") || "paint-by-numbers";

  const secondaryAction =
    "group flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-4 text-sm font-bold text-text-main shadow-sm transition-all hover:border-primary/40 hover:bg-gray-50 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:shadow-sm";

  return (
    <div className="flex flex-col gap-6">
      <BackToPbnLink />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        {/* IZQUIERDA — original vs resultado. Sin la imagen de origen (PBN
            antiguos o guardados sin source) no hay nada que comparar, así que
            cae al preview a secas. */}
        <div className="lg:col-span-7">
          <div className="aspect-4/5 w-full overflow-hidden rounded-xl bg-cream">
            {pbn.sourceImageUrl && pbn.previewUrl ? (
              <ImageCompareSlider
                originalSrc={pbn.sourceImageUrl}
                processedSrc={pbn.previewUrl}
                leftLabel="Original"
                rightLabel="Result"
                framed={false}
                fill
              />
            ) : pbn.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pbn.previewUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <span className="material-symbols-outlined text-[40px]">
                  format_paint
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DERECHA — ficha + cross-sell. Sin `sticky`, por lo mismo que en el
            detalle de obra: con el carrusel esta columna es más alta que la
            imagen. */}
        <div className="flex flex-col lg:col-span-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                Paint by Numbers
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-text-main lg:text-5xl">
                  {title}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isOrdered
                      ? "bg-primary/10 text-primary"
                      : "bg-cream text-text-muted"
                  }`}
                >
                  {isOrdered ? "Ordered" : "Saved"}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
                {pbn.colorCount ? (
                  <>
                    <span>{pbn.colorCount} colors</span>
                    <span className="text-text-muted/50">·</span>
                  </>
                ) : null}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  {formatOrderDate(pbn.createdAt)}
                </span>
              </p>
            </div>
            <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />

            {palette.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Palette
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((color, i) => (
                    <span
                      key={i}
                      title={`Color ${i + 1}`}
                      className="size-7 rounded-md border border-black/10"
                      style={{ backgroundColor: swatch(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Vuelta al estudio sobre este PBN: con `pbnId` el estudio abre
                  el SVG guardado y sus ajustes sin reprocesar (imagen de origen y
                  generación las resuelve del propio PBN). Espeja la CTA de
                  `GenerationDetail`; sin `sourceImageUrl` (PBN antiguos) no hay
                  nada que reabrir. */}
              {pbn.sourceImageUrl && (
                <Link
                  href={`/studio?pbnId=${pbn.id}`}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-100"
                >
                  <span className="material-symbols-outlined text-[20px] text-white">
                    format_paint
                  </span>
                  Convert to PBN
                </Link>
              )}

              {/* Descargas: Cloudinary sirve el archivo como adjunto vía
                  `fl_attachment`, así no hace falta traerlo por fetch. */}
              {pbn.paletteUrl && (
                <a
                  href={cloudinaryDownloadUrl(
                    pbn.paletteUrl,
                    "png",
                    `${downloadBase}-guide`,
                  )}
                  download
                  className={secondaryAction}
                >
                  <span className="material-symbols-outlined text-[20px] text-text-muted transition-colors group-hover:text-primary">
                    palette
                  </span>
                  Download mixing guide
                </a>
              )}

              {pbn.generationId && (
                <Link
                  href={`/user/generations/${pbn.generationId}`}
                  className={secondaryAction}
                >
                  <span className="material-symbols-outlined text-[20px] text-text-muted transition-colors group-hover:text-primary">
                    image
                  </span>
                  View source artwork
                </Link>
              )}

              {/* Borrar */}
              <div className="mt-1 h-px w-full bg-text-main/10" />
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={deleting}
                className="w-full p-4 inline-flex items-center justify-center gap-1.5 self-center rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
                Delete paint by numbers
              </button>
            </div>

            {/* El kit y sus accesorios comparten un carrusel: una slide a ancho
                completo cada uno. */}
            {!accessoriesLoading && (
              <Carousel gap="gap-4" showDots>
                <div className="min-w-0 flex-[0_0_100%]">
                  <PbnPurchaseCard
                    source={{ kind: "saved-pbn", ensureSaved }}
                    palette={palette}
                    previewUrl={pbn.previewUrl}
                  />
                </div>
                {accessories.map((accessory) => (
                  <div
                    key={accessory.productId}
                    className="min-w-0 flex-[0_0_100%]"
                  >
                    <AccessoryUpsell
                      accessory={accessory}
                      bundlePercent={bundlePercent}
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this Paint by Numbers?"
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
        {pbn.previewUrl && (
          <div
            className="aspect-4/5 w-full rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${pbn.previewUrl}')` }}
          />
        )}
      </ConfirmDialog>
    </div>
  );
}
