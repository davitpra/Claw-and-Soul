"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DetailErrorState } from "@/shared/ui/DetailErrorState";
import { DetailNotFound } from "@/shared/ui/DetailNotFound";
import { useGenerationDetail } from "@/entities/order/api/useGenerationDetail";
import { BackToGenerationsLink } from "@/entities/order/ui/BackToGenerationsLink";
import { GenerationImage } from "@/entities/order/ui/GenerationImage";
import { GenerationStatusBadge } from "@/entities/order/ui/GenerationStatusBadge";
import { formatOrderDate } from "@/entities/order/lib/presentation";
import {
  normalizeTemplate,
  templateLabel,
} from "@/entities/product/lib/template";
import { artKindLabel } from "@/entities/product/model/artKind";
import { Carousel } from "@/shared/ui/Carousel";
import {
  AccessoryUpsell,
  PbnPurchaseCard,
  usePbnAccessories,
} from "@/features/pbn-purchase";
import {
  GenerationProductCard,
  useGenerationProduct,
} from "@/features/generation-purchase";
import { getRelatedAccessories } from "@/widgets/related-products";

interface Props {
  id: string;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** File name for the downloaded artwork: `<style>-<pet name>.<ext>`. */
function buildDownloadName(
  styleName: string | null | undefined,
  petName: string | null | undefined,
  url: string | null | undefined,
) {
  const parts = [styleName, petName]
    .map((part) => (part ? slugify(part) : ""))
    .filter(Boolean);
  const base = parts.join("-") || "artwork";
  const extension = url
    ?.split("?")[0]
    .match(/\.(jpe?g|png|webp|gif|avif)$/i)?.[1];
  return `${base}.${extension?.toLowerCase() ?? "png"}`;
}

export function GenerationDetail({ id }: Props) {
  const router = useRouter();
  const {
    generation,
    isLoading,
    error,
    notFound,
    reload,
    deleting,
    deleteError,
    deleteGeneration,
  } = useGenerationDetail(id);

  // Producto para el que se pidió la obra. Con formato digital ya se entregó el
  // archivo, así que la card de compra sigue siendo el kit PBN y ni se resuelve
  // el producto; con formato físico se vende ese producto con la obra impresa.
  // Va antes de los early returns por las reglas de hooks.
  const isDigital =
    normalizeTemplate(generation?.productRef?.template) === "Digital";
  const sourceProduct = useGenerationProduct({
    productRefId: isDigital ? null : (generation?.productRef?.id ?? null),
    formatId: generation?.formatId,
  });

  // El kit PBN y sus accesorios genéricos solo hacen falta cuando no hay producto
  // de origen que vender: `unavailable` ya cubre obra digital, generación legacy
  // sin productRef y producto desactivado o sin variantes. Mientras un producto
  // físico resuelve el flag es false, así que no se dispara ninguna de las cuatro
  // peticiones (una de ellas la mutación cartCreate del sondeo de descuento).
  const {
    accessories: kitAccessories,
    loading: accessoriesLoading,
    kitAvailable,
    bundlePercent,
  } = usePbnAccessories(sourceProduct.unavailable);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDelete() {
    const ok = await deleteGeneration();
    if (ok) router.push("/user/generations");
  }

  async function handleDownload(url: string, fileName: string) {
    setDownloading(true);
    try {
      // The image lives on a different origin, so `<a download>` is ignored:
      // fetch it as a blob to control the file name.
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
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
          <div className="mt-4 h-14 w-full animate-pulse rounded-xl bg-cream" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-12 w-full animate-pulse rounded-xl bg-cream" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-cream" />
          </div>
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
  const downloadName = buildDownloadName(
    styleName,
    generation.pet?.name,
    imageUrl,
  );
  // Tipo de producto de cara al cliente: formato + contenido, ej. "Canvas Print ·
  // Paint by Numbers". Mismo criterio que la ficha de producto (ProductInfo).
  const productLabel =
    [
      templateLabel(generation.productRef?.template),
      artKindLabel(generation.productRef?.artKind),
    ]
      .filter(Boolean)
      .join(" · ") || "Personalized";

  // Card principal del carrusel: el producto de origen si es físico y se pudo
  // resolver, y si no el kit PBN (obra digital, generación legacy sin
  // productRef, producto desactivado o handle que ya no existe en Shopify).
  const showProductCard = !sourceProduct.unavailable && !!sourceProduct.product;
  const showPbnCard = !showProductCard && kitAvailable;

  // Los accesorios acompañan a la card principal: con producto de origen salen
  // sus relacionados curados en Shopify (los mismos de su ficha, sin relleno si
  // no hay ninguno); con el kit, la colección genérica pbn-accessories. El badge
  // de descuento solo vale en la ruta del kit, que es donde se sondeó.
  const accessories = showProductCard
    ? getRelatedAccessories(sourceProduct.product)
    : kitAccessories;

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

        {/* DERECHA — ficha + cross-sell. Sin `sticky`: con el carrusel del kit
            esta columna es más alta que la imagen, así que fijarla no aporta
            nada y hacía que el carrusel (posicionado) se pintara encima del
            panel clavado al hacer scroll. */}
        <div className="flex flex-col lg:col-span-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {styleName && (
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {styleName}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-text-main lg:text-5xl">
                  {petName}
                </h1>
                <GenerationStatusBadge status={status} />
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
                <span>{productLabel}</span>
                <span className="text-text-muted/50">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  {formatOrderDate(generation.createdAt)}
                </span>
              </p>
            </div>
            <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />

            <div className="flex flex-col gap-3">
              {/* Acciones secundarias — PBN y descarga */}
              {isReady && imageUrl && (
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`/studio?generationId=${generation.id}&imageUrl=${encodeURIComponent(imageUrl)}${generation.style?.id ? `&styleId=${generation.style.id}` : ""}`}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-100"
                  >
                    <span className="material-symbols-outlined text-[20px] text-white transition-colors group-hover:text-primary">
                      format_paint
                    </span>
                    Convert to PBN
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDownload(imageUrl, downloadName)}
                    disabled={downloading}
                    className="group flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-4 text-sm font-bold text-text-main shadow-sm transition-all hover:border-primary/40 hover:bg-gray-50 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] text-text-muted transition-colors group-hover:text-primary ${
                        downloading ? "animate-pulse" : ""
                      }`}
                    >
                      download
                    </span>
                    {downloading ? "Downloading…" : "Download image"}
                  </button>
                </div>
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
                Delete artwork
              </button>
            </div>

            {/* El kit y sus accesorios comparten un carrusel: una slide a ancho
                completo cada uno. El padding horizontal deja sitio a las
                flechas, que Embla dibuja fuera del viewport. Solo con la obra
                terminada: no tiene sentido vender un kit de una generación que
                falló o sigue procesando. */}
            {isReady &&
              imageUrl &&
              !accessoriesLoading &&
              !sourceProduct.loading &&
              (showProductCard || showPbnCard || accessories.length > 0) && (
                <div className="">
                  <Carousel gap="gap-4" showDots>
                    {/* Producto de origen: el canvas o póster que el cliente
                        eligió antes de generar, con su obra impresa. */}
                    {showProductCard && (
                      <div className="min-w-0 flex-[0_0_100%]">
                        <GenerationProductCard
                          source={sourceProduct}
                          generationId={generation.id}
                          artworkUrl={imageUrl}
                          productLabel={productLabel}
                          styleName={styleName}
                        />
                      </div>
                    )}
                    {/* Kit PBN: aquí no hay PBN renderizado, así que la línea
                        viaja con `generationId` y producción monta la plantilla
                        desde la generación. */}
                    {showPbnCard && (
                      <div className="min-w-0 flex-[0_0_100%]">
                        <PbnPurchaseCard
                          previewUrl={imageUrl}
                          source={{
                            kind: "generation",
                            generationId: generation.id,
                          }}
                        />
                      </div>
                    )}
                    {/* Cross-sell: relacionados del producto, o los accesorios
                        genéricos si la card principal es el kit. Líneas sueltas,
                        sin acoplarse a la generación. */}
                    {accessories.map((accessory) => (
                      <div
                        key={accessory.productId}
                        className="min-w-0 flex-[0_0_100%]"
                      >
                        <AccessoryUpsell
                          accessory={accessory}
                          bundlePercent={showProductCard ? null : bundlePercent}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
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
