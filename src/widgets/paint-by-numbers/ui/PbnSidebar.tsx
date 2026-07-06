"use client";

import { PbnBuyButton } from "@/features/pbn-purchase";
import type { useImageInput } from "../model/useImageInput";
import type { InputOptions } from "../model/useInputOptions";
import type { ExportControls as ExportControlsState } from "../model/useExport";
import { card, stepNum, stepTitle } from "./pbnStyles";
import InputOptionsPane from "./InputOptionsPane";
import ExportControls from "./ExportControls";

interface PbnSidebarProps {
  imageInput: ReturnType<typeof useImageInput>;
  inputOptions: InputOptions;
  exp: ExportControlsState;
  hasOutput: boolean;
  savedPbn: { id: string; previewUrl?: string | null } | null;
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
  exp,
  hasOutput,
  savedPbn,
}: PbnSidebarProps) {
  const {
    fileInputRef,
    onFileChange,
    imageSrc,
    isDragging,
    openFilePicker,
    onDragOver,
    onDragLeave,
    onDrop,
  } = imageInput;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Step 1: Upload your image */}
      <section className={card}>
        <h3 className={stepTitle}>
          <span className={stepNum}>1</span>
          Upload your image
        </h3>
        <p className="mt-2 font-body text-sm text-text-muted">
          Upload a clear photo with good lighting.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          onChange={onFileChange}
          hidden
        />
        <button
          type="button"
          className={`mt-4 flex min-h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5"
          }`}
          onClick={openFilePicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {imageSrc ? (
            <div className="group relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Selected image preview"
                className="mx-auto max-h-52 w-auto rounded-lg"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 font-body text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Click or drop to replace
              </span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl text-primary">
                upload_file
              </span>
              <span className="font-body text-sm text-slate-dark">
                Drag &amp; drop your image here, or{" "}
                <strong>click to browse</strong>
              </span>
              <span className="font-body text-xs text-text-muted">
                Paste from your clipboard (Ctrl+V) · PNG, JPG or GIF
              </span>
            </>
          )}
        </button>
      </section>

      {/* Step 2: Image settings */}
      <section className={card}>
        <h3 className={`${stepTitle}`}>
          <span className={stepNum}>2</span>
          Image settings
        </h3>
        <InputOptionsPane opts={inputOptions} imageSrc={imageSrc} />
      </section>

      {/* Step 3: Preview & download */}
      {hasOutput && (
        <section className={`${card}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={stepTitle}>
              <span className={stepNum}>3</span>
              Preview &amp; download
            </h3>
          </div>

          <div className="mt-4">
            <ExportControls exp={exp} hasOutput={hasOutput} />
          </div>
        </section>
      )}

      {savedPbn && (
        <section className={card}>
          <PbnBuyButton pbn={savedPbn} variant="inline" />{" "}
        </section>
      )}
    </div>
  );
}
