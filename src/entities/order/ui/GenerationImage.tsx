import { ImageZoom } from "@/shared/ui/ImageZoom";

interface GenerationImageProps {
  status: string;
  imageUrl: string | null;
  errorMessage: string | null;
  alt: string;
}

/**
 * Panel de imagen del detalle de una generación. Tres estados:
 *  - completada con imagen → imagen flotante con zoom,
 *  - fallida → caja con el mensaje de error,
 *  - en proceso → spinner.
 */
export function GenerationImage({
  status,
  imageUrl,
  errorMessage,
  alt,
}: GenerationImageProps) {
  const isReady = status === "completed";
  const isFailed = status === "failed";

  return (
    <div className="flex items-center justify-center px-4 pt-4 pb-10 md:px-8">
      {isReady && imageUrl ? (
        <ImageZoom alt={alt}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="h-auto w-full bg-white shadow-[0_14px_32px_-12px_rgba(16,54,66,0.40)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]"
          />
        </ImageZoom>
      ) : isFailed ? (
        <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-3 rounded-xl bg-cream text-center text-text-muted">
          <span className="material-symbols-outlined text-[40px] text-red-500">
            error
          </span>
          <p className="px-6 text-sm">
            {errorMessage ?? "This generation failed to complete."}
          </p>
        </div>
      ) : (
        <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-3 rounded-xl bg-cream text-center text-text-muted">
          <div className="size-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm">Your artwork is still being created…</p>
        </div>
      )}
    </div>
  );
}
