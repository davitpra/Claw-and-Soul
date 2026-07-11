"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RGB } from "@/lib/pbn/common";
import { buildHighlightOverlayDataUrl } from "@/lib/pbn/highlight";
import { getPaperAspect } from "@/lib/pbn/svgExport";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useSavePbn } from "../model/useSavePbn";
import { PAPER_LABELS, ENABLE_MIXING_GUIDE } from "../model/constants";
import { useLog } from "../model/useLog";
import { useImageInput } from "../model/useImageInput";
import { useInputOptions, InputOptionsInit } from "../model/useInputOptions";
import { useRenderOptions, RenderOptionsInit } from "../model/useRenderOptions";
import { useStylePbnConfig } from "../model/useStylePbnConfig";
import { usePaintMixing } from "../model/usePaintMixing";
import { useProcessing } from "../model/useProcessing";
import { useExport } from "../model/useExport";
import DropZone from "./DropZone";
import CropModal from "./CropModal";
import Modal from "./Modal";
import ImageCompareSlider from "./ImageCompareSlider";
import ProgressBar from "./ProgressBar";
import RenderOptionsPane from "./RenderOptionsPane";
import PbnPostHeader from "./PbnPostHeader";
import { PbnPostMenuItem } from "./PbnPostMenu";
import MixingGuide from "./MixingGuide";
import ColorPalette from "./ColorPalette";
import InputOptionsPane from "./InputOptionsPane";
import ProcessButtons from "./ProcessButtons";
import PbnSidebar from "./PbnSidebar";
import PbnSettingsDrawer from "./PbnSettingsDrawer";
import ExportControls from "./ExportControls";
import { card, stepTitle } from "./pbnStyles";
import { PbnPurchaseCard } from "@/features/pbn-purchase";

// Al llegar desde "Enviar a PBN" (detalle de generación) traemos la imagen del
// artwork por query param para precargarla en el canvas; generationId liga el
// PBN guardado a esa generación (ver handleSave) y styleId trae el default PBN
// del estilo (Style.pbnConfig) con el que se seedean los paneles de opciones.
export default function PaintByNumbers() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get("generationId");
  const initialImageUrl = searchParams.get("imageUrl");
  const styleId = searchParams.get("styleId");

  // Los hooks de opciones solo leen su init en el primer render, así que el
  // estudio no se monta hasta resolver el fetch (sin styleId resuelve al tiro).
  const { inputInit, renderInit, loading } = useStylePbnConfig(styleId);
  if (loading) return null;

  return (
    <PaintByNumbersStudio
      generationId={generationId}
      initialImageUrl={initialImageUrl}
      inputInit={inputInit}
      renderInit={renderInit}
    />
  );
}

function PaintByNumbersStudio({
  generationId,
  initialImageUrl,
  inputInit,
  renderInit,
}: {
  generationId: string | null;
  initialImageUrl: string | null;
  inputInit?: InputOptionsInit;
  renderInit?: RenderOptionsInit;
}) {
  const { log, clearLog } = useLog();

  // Keep the whole object so it can be handed to <PbnSidebar> as one prop; the
  // main preview area only needs the two refs below.
  const imageInput = useImageInput(log, initialImageUrl);
  const {
    inputCanvasRef,
    originalImageRef,
    imageSrc,
    isDragging,
    openFilePicker,
    onDragOver,
    onDragLeave,
    onDrop,
  } = imageInput;

  const inputOptions = useInputOptions(inputInit);
  const renderOptions = useRenderOptions(renderInit);
  const { recipes, setRecipes, computeRecipes } = usePaintMixing();
  const guideRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(false);
  // Index of the palette color whose sections are highlighted on the result.
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  // Close the mixing-guide modal with Escape.
  useEffect(() => {
    if (!showGuide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowGuide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGuide]);

  const onProcessStart = useCallback(() => {
    setRecipes(null);
    // drop the highlight tied to the palette that's about to be replaced
    setSelectedColor(null);
  }, [setRecipes]);
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

  // Overlay that spotlights the selected color's sections on the result. Rebuilt
  // when the color, palette (reprocessed) or the border/label render options
  // change so the overlay's border and numbers track the base image.
  const highlightSrc = useMemo(() => {
    const result = processResultRef.current;
    if (selectedColor === null || !result) return undefined;
    return buildHighlightOverlayDataUrl(
      result.facetResult,
      selectedColor,
      result.colorsByIndex,
      {
        showBorders: renderOptions.showBorders,
        showLabels: renderOptions.showLabels,
        fontSize: renderOptions.labelFontSize,
        fontColor: renderOptions.labelFontColor,
        strokeWidth: 1 / 3, // match the base image's 1px stroke at 3× multiplier
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedColor,
    palette,
    renderOptions.showBorders,
    renderOptions.showLabels,
    renderOptions.labelFontSize,
    renderOptions.labelFontColor,
  ]);

  // ---- Save to account ----
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { save, saving, savedId, error: saveError } = useSavePbn();
  const [savedPbn, setSavedPbn] = useState<{
    id: string;
    previewUrl?: string | null;
  } | null>(null);

  // Modals opened from the Instagram-style post ⋯ menu / action row.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleSave = useCallback(async (): Promise<{
    id: string;
    previewUrl?: string | null;
  } | null> => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/paint-by-numbers");
      return null;
    }
    const saved = await save({
      svgContainerRef,
      guideRef,
      previewDataUrl: compareImgs?.processed,
      sourceDataUrl: originalImageRef.current,
      palette,
      recipes,
      generationId,
      config: {
        input: inputOptions.buildSettings(),
        render: {
          showLabels: renderOptions.showLabels,
          fillFacets: renderOptions.fillFacets,
          showBorders: renderOptions.showBorders,
          labelFontSize: renderOptions.labelFontSize,
          labelFontColor: renderOptions.labelFontColor,
          fillOpacity: renderOptions.fillOpacity,
        },
        paper: {
          format: exp.paperFormat,
          orientation: exp.paperOrientation,
          width: exp.pdfWidth,
          height: exp.pdfHeight,
          unit: exp.pdfUnit,
        },
      },
    });
    if (!saved) return null;
    const savedRef = {
      id: saved.id,
      previewUrl: (saved.previewUrl as string | undefined) ?? null,
    };
    setSavedPbn(savedRef);
    return savedRef;
  }, [
    isAuthenticated,
    router,
    save,
    svgContainerRef,
    guideRef,
    compareImgs,
    originalImageRef,
    palette,
    recipes,
    generationId,
    inputOptions,
    renderOptions,
    exp,
  ]);

  // Resolve a saved PBN for the purchase card: reuse the existing one, or save
  // on demand (handleSave redirects to login when there's no session).
  const ensureSaved = useCallback(
    () => (savedPbn ? Promise.resolve(savedPbn) : handleSave()),
    [savedPbn, handleSave],
  );

  const showResult = !!compareImgs && !isProcessing;

  const canSave = hasOutput && !isProcessing;
  const menuItems: PbnPostMenuItem[] = [
    {
      label: "Settings",
      icon: "tune",
      onClick: () => setSettingsOpen(true),
    },
    {
      label: savedId ? "Saved" : "Save to my account",
      icon: savedId ? "check_circle" : "bookmark_add",
      onClick: handleSave,
      hidden: !canSave,
    },
    {
      label: "Download",
      icon: "download",
      onClick: () => setDownloadOpen(true),
      hidden: !hasOutput,
    },
    {
      label: "Color mixing guide",
      icon: "palette",
      onClick: () => setShowGuide(true),
      hidden: !ENABLE_MIXING_GUIDE || !recipes,
    },
  ];

  // On mobile the sidebar lives in a bottom sheet; on desktop it stays inline in
  // the grid. A single mounted instance is reused in both places (mounting twice
  // would duplicate the file <input> and its ref).
  const isMobile = useIsMobile();
  const sidebar = (
    <PbnSidebar
      imageInput={imageInput}
      inputOptions={inputOptions}
      exp={exp}
      hasOutput={hasOutput}
      isProcessing={isProcessing}
      onProcess={() => void process()}
      onCancel={cancel}
    />
  );

  return (
    <div className="container-site px-6 py-4 lg:px-10">
      <div className="h-full grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,380px)]">
        {/* ---- Main: preview area ---- */}
        <main className="flex flex-col">
          {/*Progress bar: only shown while processing, hidden once the result is available */}
          {!showResult && <ProgressBar overall={overall} />}
          {/* Preview PBN box*/}
          <div className="relative flex flex-none items-stretch justify-center ">
            <div
              className="mx-auto flex h-full w-fit justify-center overflow-hidden rounded-xl border-4 bg-white border-white shadow-xl"
              hidden={showResult || !imageSrc}
            >
              <canvas
                ref={inputCanvasRef}
                className="block w-auto max-w-full object-cover h-[calc(80dvh)]"
              />
              {isProcessing && (
                <div className="absolute inset-0 animate-pulse bg-white/40 h-[calc(80dvh)]" />
              )}
            </div>
            {!imageSrc && !showResult && (
              <DropZone
                isDragging={isDragging}
                openFilePicker={openFilePicker}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              />
            )}
            {/* Result PBN — Instagram-style post: header overlay (avatar + name
                + ⋯ menu) on top of the compare slider. */}
            {showResult && compareImgs && (
              <div className="relative mx-auto w-fit max-w-full">
                <ImageCompareSlider
                  originalSrc={compareImgs.original}
                  processedSrc={compareImgs.processed}
                  highlightSrc={highlightSrc}
                  leftLabel="Original"
                  rightLabel="Result"
                />
                <PbnPostHeader menuItems={menuItems} />
                {savedId && (
                  <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 shadow-md backdrop-blur">
                    <p className="font-body text-sm text-background-dark">
                      Saved.{" "}
                      <a href="/user/pbn" className="font-semibold underline">
                        View my Paint by Numbers
                      </a>
                    </p>
                  </div>
                )}
                {saveError && (
                  <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 font-body text-sm text-red-600 shadow-md backdrop-blur">
                    {saveError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Image settings panel for Mobile */}
          {isMobile && !showResult && (
            <section className={`${card} mt-4`}>
              <h3 className={stepTitle}>Image settings</h3>
              <div className="mt-4">
                <InputOptionsPane
                  opts={inputOptions}
                  imageSrc={imageSrc}
                  showAdvanced={false}
                />
              </div>
              <div className="mt-4">
                <ProcessButtons
                  isProcessing={isProcessing}
                  hasImage={!!imageSrc}
                  onProcess={() => void process()}
                  onCancel={cancel}
                />
              </div>
            </section>
          )}

          {/* Instagram-style post footer: action row + palette as "caption". */}
          {showResult && (
            <div className="mx-auto mt-2 w-full max-w-full">
              <div className="flex items-center gap-1 px-1">
                {menuItems
                  .filter((i) => !i.hidden)
                  .map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      title={item.label}
                      aria-label={item.label}
                      className="flex size-10 items-center justify-center rounded-full text-slate-dark transition-colors hover:bg-cream disabled:opacity-50"
                      disabled={item.label !== "Settings" && saving}
                    >
                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          saving && item.icon === "bookmark_add"
                            ? "animate-spin"
                            : ""
                        }`}
                      >
                        {saving && item.icon === "bookmark_add"
                          ? "progress_activity"
                          : item.icon}
                      </span>
                    </button>
                  ))}
              </div>
              <div className="mt-2">
                <ColorPalette
                  palette={palette}
                  recipes={recipes}
                  showGuide={showGuide}
                  onToggleGuide={() => setShowGuide((v) => !v)}
                  mixingEnabled={ENABLE_MIXING_GUIDE}
                  selectedColor={selectedColor}
                  onSelectColor={(i) =>
                    setSelectedColor((prev) => (prev === i ? null : i))
                  }
                />
              </div>
            </div>
          )}

          {/* Purchase card: appears with the result, saves on demand at buy. */}
          {showResult && (
            <PbnPurchaseCard
              palette={palette}
              previewUrl={compareImgs?.processed}
              ensureSaved={ensureSaved}
            />
          )}
        </main>

        {/* Settings (render options) opened from the post ⋯ menu. */}
        <RenderOptionsPane
          opts={renderOptions}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        {/* Download opened from the post ⋯ menu / action row. */}
        <Modal
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          title="Download"
          maxWidth="max-w-lg"
          label="Download"
        >
          <div className="p-6">
            <ExportControls exp={exp} hasOutput={hasOutput} />
          </div>
        </Modal>

        {/* The mixing guide opens in a modal when toggled. When closed it
              stays mounted off-screen so PNG/PDF export can still capture it. */}
        {ENABLE_MIXING_GUIDE && (
          <>
            <Modal
              open={showGuide}
              title="Color mixing guide"
              onClose={() => setShowGuide(false)}
              label="Color mixing guide"
            >
              <MixingGuide
                recipes={recipes}
                palette={palette}
                guideRef={guideRef}
              />
            </Modal>
            {!showGuide && (
              <div
                className="pointer-events-none absolute -left-2499.75 top-0"
                aria-hidden
              >
                <MixingGuide
                  recipes={recipes}
                  palette={palette}
                  guideRef={guideRef}
                />
              </div>
            )}
          </>
        )}

        {/* ---- Sidebar: numbered step cards (inline on desktop) ---- */}
        {!isMobile && <aside>{sidebar}</aside>}
      </div>

      {/* On mobile the same sidebar lives in a bottom sheet. */}
      {isMobile && showResult && (
        <PbnSettingsDrawer>{sidebar}</PbnSettingsDrawer>
      )}

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

      {/* intermediate-step canvases and the SVG output container: kept in the
          DOM as draw targets for the pipeline, but never shown to the user */}
      <div hidden>
        <canvas ref={kmeansCanvasRef} />
        <canvas ref={reductionCanvasRef} />
        <canvas ref={borderPathCanvasRef} />
        <canvas ref={borderSegmentationCanvasRef} />
        <canvas ref={labelPlacementCanvasRef} />
        <div ref={svgContainerRef} />
      </div>
    </div>
  );
}
