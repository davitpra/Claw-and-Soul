"use client";

import type { useImageInput } from "@/features/pbn-studio";
import { card, btnSecondary } from "@/features/pbn-studio/ui/pbnStyles";

interface PbnImageStepProps {
  imageInput: ReturnType<typeof useImageInput>;
}

/**
 * Step 1 of the Paint by Numbers sidebar: the image upload card. Shows a
 * thumbnail (click to replace) once an image is selected, otherwise an upload
 * button. Purely presentational — the hidden file <input> it drives lives in
 * <Studio>, so this card is safe to mount in the mobile and desktop
 * layouts alike.
 */
export default function PbnImageStep({ imageInput }: PbnImageStepProps) {
  const { imageSrc, openFilePicker } = imageInput;

  return (
    <section className={card}>
      {imageSrc ? (
        <div className="flex items-center justify-start gap-4">
          <button
            type="button"
            onClick={openFilePicker}
            aria-label="Change image"
            className="group relative size-20 shrink-0 overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Selected image preview"
              className="size-full object-cover"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="material-symbols-outlined text-[18px] text-white">
                sync
              </span>
              <span className="font-body text-[10px] font-semibold text-white">
                Change
              </span>
            </span>
          </button>
          <div className="min-w-0">
            <p className="font-display text-base font-black text-slate-dark">
              Your image
            </p>
            <p className="mt-0.5 font-body text-xs text-text-muted">
              Click the image to replace it.
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          className={`${btnSecondary} w-full`}
        >
          <span className="material-symbols-outlined text-[18px]">
            upload_file
          </span>
          Upload image
        </button>
      )}
    </section>
  );
}
