"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RGB } from "@/lib/pbn/common";
import { buildHighlightOverlayDataUrl } from "@/lib/pbn/highlight";
import { getPaperAspect } from "@/lib/pbn/svgExport";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  PAPER_LABELS,
  ENABLE_MIXING_GUIDE,
  ProgressBar,
  useLog,
  useImageInput,
  useInputOptions,
  useRenderOptions,
  usePaintMixing,
  useProcessing,
  useExport,
  type InputOptionsInit,
  type RenderOptionsInit,
} from "@/features/pbn-studio";
import { useSavePbnFlow } from "../model/useSavePbnFlow";
import { useStylePbnConfig } from "../model/useStylePbnConfig";
import {
  STOREFRONT_INITIAL_IMAGE,
  STOREFRONT_INPUT_DEFAULTS,
  STOREFRONT_RENDER_DEFAULTS,
} from "../model/defaults";
import DropZone from "./DropZone";
import CropModal from "./CropModal";
import Modal from "./Modal";
import RenderOptionsPane from "./RenderOptionsPane";
import { PbnPostMenuItem } from "./PbnPostMenu";
import MixingGuide from "./MixingGuide";
import InputOptionsPane from "./InputOptionsPane";
import ProcessButtons from "./ProcessButtons";
import PbnSidebar from "./PbnSidebar";
import PbnSettingsDrawer from "./PbnSettingsDrawer";
import ExportControls from "./ExportControls";
import PbnResultView from "./PbnResultView";
import { card, stepTitle } from "@/features/pbn-studio/ui/pbnStyles";

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
      initialImageUrl={initialImageUrl ?? STOREFRONT_INITIAL_IMAGE}
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

  // A style's saved pbnConfig (JSON, so never carries explicit undefined) wins
  // over the surface defaults field by field.
  const inputOptions = useInputOptions({
    ...STOREFRONT_INPUT_DEFAULTS,
    ...inputInit,
  });
  const renderOptions = useRenderOptions({
    ...STOREFRONT_RENDER_DEFAULTS,
    ...renderInit,
  });
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
        // match the base image's 1px stroke at the SVG's scale factor
        strokeWidth: 1 / renderOptions.sizeMultiplier,
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
    renderOptions.sizeMultiplier,
  ]);

  // ---- Save to account ----
  const { handleSave, ensureSaved, saving, savedId, saveError } =
    useSavePbnFlow({
      svgContainerRef,
      guideRef,
      originalImageRef,
      compareImgs,
      palette,
      recipes,
      generationId,
      inputOptions,
      renderOptions,
      exp,
    });

  // Modals opened from the Instagram-style post ⋯ menu / action row.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

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
      hidden: !ENABLE_MIXING_GUIDE || !hasOutput,
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
      {/* minmax(0,1fr): without it the main column can't shrink below its
          content's min-content width, and the wide result cards squash the sidebar. */}
      <div className="h-full grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        {/* ---- Main: preview area ---- */}
        <main className="flex min-w-0 flex-col">
          {/* Preview PBN box*/}
          <section className="relative flex flex-none items-stretch justify-center ">
            <div
              className="relative mx-auto flex h-full w-fit justify-center overflow-hidden rounded-xl border-4 bg-white border-white shadow-xl"
              hidden={showResult || !imageSrc}
            >
              {/*Preview Image Pre-processing */}
              <canvas
                ref={inputCanvasRef}
                className="block w-auto max-w-full object-cover h-[calc(80dvh)]"
              />
              {/* Processing animation */}
              {isProcessing && (
                <div className="absolute inset-0 animate-pulse bg-white/40" />
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
          </section>

          {/*Progress bar: only shown while processing, hidden once the result is available */}
          {!showResult && <ProgressBar overall={overall} />}

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

          {showResult && compareImgs && (
            <PbnResultView
              compareImgs={compareImgs}
              highlightSrc={highlightSrc}
              menuItems={menuItems}
              saving={saving}
              savedId={savedId}
              saveError={saveError}
              palette={palette}
              recipes={recipes}
              showGuide={showGuide}
              onToggleGuide={() => setShowGuide((v) => !v)}
              selectedColor={selectedColor}
              onSelectColor={(i) =>
                setSelectedColor((prev) => (prev === i ? null : i))
              }
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
            <ExportControls
              exp={exp}
              hasOutput={hasOutput}
              onClose={() => setDownloadOpen(false)}
            />
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
