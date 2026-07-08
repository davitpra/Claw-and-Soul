"use client";

import { PbnBuyButton } from "@/features/pbn-purchase";
import type { useImageInput } from "../model/useImageInput";
import type { InputOptions } from "../model/useInputOptions";
import type { ExportControls as ExportControlsState } from "../model/useExport";
import { card, stepNum, stepTitle, btnSecondary } from "./pbnStyles";
import InputOptionsPane from "./InputOptionsPane";
import ProcessButtons from "./ProcessButtons";

interface PbnSidebarProps {
  imageInput: ReturnType<typeof useImageInput>;
  inputOptions: InputOptions;
  exp: ExportControlsState;
  hasOutput: boolean;
  savedPbn: { id: string; previewUrl?: string | null } | null;
  isProcessing: boolean;
  onProcess: () => void;
  onCancel: () => void;
}

/**
 * The numbered step cards (upload, image settings, export) that make up the
 * Paint by Numbers sidebar. Extracted so a single mounted instance can be placed
 * either inline in the desktop grid column or inside the mobile bottom sheet —
 * mounting it twice would duplicate the file <input> and its ref.
 */
export default function PbnSidebar({
  imageInput,
  inputOptions,
  savedPbn,
  isProcessing,
  onProcess,
  onCancel,
}: PbnSidebarProps) {
  const { fileInputRef, onFileChange, imageSrc, openFilePicker } = imageInput;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Step 1: image — thumbnail on the right, click to replace */}
      <section className={card}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          onChange={onFileChange}
          hidden
        />
        {imageSrc ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-base font-black text-slate-dark">
                Your image
              </p>
              <p className="mt-0.5 font-body text-xs text-text-muted">
                Click the image to replace it.
              </p>
            </div>
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

      {/* Step 2: Image settings */}
      <section className={card}>
        <h3 className={`${stepTitle}`}>
          <span className={stepNum}>2</span>
          Image settings
        </h3>
        <InputOptionsPane opts={inputOptions} imageSrc={imageSrc} />
      </section>
      {/* Buttons for process*/}
      <ProcessButtons
        isProcessing={isProcessing}
        onProcess={onProcess}
        onCancel={onCancel}
      />

      {savedPbn && (
        <section className={card}>
          <PbnBuyButton pbn={savedPbn} variant="inline" />{" "}
        </section>
      )}
    </div>
  );
}
