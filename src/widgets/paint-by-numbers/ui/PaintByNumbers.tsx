"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RGB } from "@/lib/pbn/common";
import { getPaperAspect } from "@/lib/pbn/svgExport";
import { PAPER_LABELS, ENABLE_MIXING_GUIDE } from "../model/constants";
import { useLog } from "../model/useLog";
import { useImageInput } from "../model/useImageInput";
import { useInputOptions } from "../model/useInputOptions";
import { useRenderOptions } from "../model/useRenderOptions";
import { usePaintMixing } from "../model/usePaintMixing";
import { useProcessing } from "../model/useProcessing";
import { useExport } from "../model/useExport";
import { btnPrimary, btnSecondary, card, stepNum, stepTitle } from "./pbnStyles";
import CropModal from "./CropModal";
import ImageCompareSlider from "./ImageCompareSlider";
import InputOptionsPane from "./InputOptionsPane";
import ProgressBar from "./ProgressBar";
import RenderOptionsPane from "./RenderOptionsPane";
import MixingGuide from "./MixingGuide";
import ExportControls from "./ExportControls";

export default function PaintByNumbers() {
  const { log, clearLog } = useLog();

  const {
    inputCanvasRef,
    fileInputRef,
    originalImageRef,
    onFileChange,
    imageSrc,
    isDragging,
    openFilePicker,
    onDragOver,
    onDragLeave,
    onDrop,
  } = useImageInput(log);

  const inputOptions = useInputOptions();
  const renderOptions = useRenderOptions();
  const { recipes, setRecipes, computeRecipes } = usePaintMixing();
  const guideRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Close the mixing-guide modal with Escape.
  useEffect(() => {
    if (!showGuide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowGuide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGuide]);

  const onProcessStart = useCallback(() => setRecipes(null), [setRecipes]);
  const onComplete = useCallback(
    (colors: RGB[]) => {
      // La guía de mezcla usa spectral.js (MIT). Sólo se calcula cuando el
      // feature flag está activo, así la matemática de mezcla queda fuera del
      // bundle inicial si no.
      if (ENABLE_MIXING_GUIDE) void computeRecipes(colors);
    },
    [computeRecipes],
  );

  const {
    kmeansCanvasRef,
    reductionCanvasRef,
    borderPathCanvasRef,
    borderSegmentationCanvasRef,
    labelPlacementCanvasRef,
    svgContainerRef,
    processResultRef,
    compareImgs,
    overall,
    palette,
    hasOutput,
    isProcessing,
    process,
    cancel,
  } = useProcessing({
    buildSettings: inputOptions.buildSettings,
    renderOptions,
    inputCanvasRef,
    originalImageRef,
    log,
    clearLog,
    onProcessStart,
    onComplete,
  });

  const exp = useExport({
    svgContainerRef,
    guideRef,
    processResultRef,
    recipes,
    palette,
  });

  const showResult = !!compareImgs && !isProcessing;

  return (
    <div className="container-site px-6 py-12 lg:px-10">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-black text-slate-dark md:text-4xl">
          Paint by Numbers
        </h1>
        <p className="mt-2 font-body text-text-muted">
          Convierte cualquier foto en una plantilla para pintar por números.
          Pega desde el portapapeles (Ctrl+V) o sube un archivo. Las imágenes
          muy grandes tardan más en procesarse.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---- Sidebar: numbered step cards ---- */}
        <aside className="flex flex-col gap-6">
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
            <h3 className={`${stepTitle} mb-4`}>
              <span className={stepNum}>2</span>
              Image settings
            </h3>
            <InputOptionsPane opts={inputOptions} />
          </section>
        </aside>

        {/* ---- Main: preview area ---- */}
        <main className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <strong className="font-display font-black text-slate-dark">
              Preview
            </strong>
            <button
              className={btnPrimary}
              onClick={() => void process()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Processing...
                </>
              ) : (
                "Process image"
              )}
            </button>
            {isProcessing && (
              <button className={btnSecondary} onClick={cancel}>
                Cancel
              </button>
            )}
          </div>

          <ProgressBar overall={overall} />

          <div className="relative">
            {/* keep the canvas mounted (the pipeline writes to it) but hide it
                once the comparison slider is available */}
            <div
              className="overflow-hidden rounded-xl border-4 border-white shadow-xl"
              hidden={showResult}
            >
              <canvas ref={inputCanvasRef} className="block h-auto w-full" />
              {isProcessing && (
                <div className="absolute inset-0 animate-pulse bg-white/40" />
              )}
            </div>
            {showResult && compareImgs && (
              <ImageCompareSlider
                originalSrc={compareImgs.original}
                processedSrc={compareImgs.processed}
                leftLabel="Original"
                rightLabel="Result"
              />
            )}
          </div>

          {showResult && (
            <RenderOptionsPane
              opts={renderOptions}
              palette={palette}
              recipes={recipes}
              showGuide={showGuide}
              onToggleGuide={() => setShowGuide((v) => !v)}
              mixingEnabled={ENABLE_MIXING_GUIDE}
            />
          )}

          {/* keep the SVG container mounted (the pipeline writes into it) but
              hide it until the image has finished processing */}
          <div
            ref={svgContainerRef}
            className="mt-6 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            hidden={!showResult}
          />

          {/* The mixing guide opens in a modal when toggled. When closed it
              stays mounted off-screen so PNG/PDF export can still capture it. */}
          {ENABLE_MIXING_GUIDE &&
            (showGuide ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setShowGuide(false)}
              >
                <div
                  className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end border-b border-[#E0DED9] px-4 py-3">
                    <button
                      className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-slate-dark"
                      onClick={() => setShowGuide(false)}
                      aria-label="Close"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        close
                      </span>
                    </button>
                  </div>
                  <div className="overflow-y-auto">
                    <MixingGuide
                      recipes={recipes}
                      palette={palette}
                      guideRef={guideRef}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="pointer-events-none absolute -left-[9999px] top-0"
                aria-hidden
              >
                <MixingGuide
                  recipes={recipes}
                  palette={palette}
                  guideRef={guideRef}
                />
              </div>
            ))}

          <section className={`${card} mt-6`}>
            <h3 className={stepTitle}>
              <span className={stepNum}>3</span>
              Preview &amp; download
            </h3>
            <ExportControls exp={exp} hasOutput={hasOutput} />
          </section>
        </main>
      </div>

      {exp.cropModal && (
        <CropModal
          imageSrc={exp.cropModal.src}
          imageWidth={exp.cropModal.w}
          imageHeight={exp.cropModal.h}
          aspect={getPaperAspect(exp.paperFormat, exp.paperOrientation)}
          title={`${PAPER_LABELS[exp.paperFormat]} ${exp.paperOrientation}`}
          onCancel={() => exp.setCropModal(null)}
          onConfirm={exp.handleCropConfirm}
        />
      )}

      {/* intermediate-step canvases: kept in the DOM as draw targets for the
          pipeline, but never shown to the user */}
      <div hidden>
        <canvas ref={kmeansCanvasRef} />
        <canvas ref={reductionCanvasRef} />
        <canvas ref={borderPathCanvasRef} />
        <canvas ref={borderSegmentationCanvasRef} />
        <canvas ref={labelPlacementCanvasRef} />
      </div>
    </div>
  );
}
