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
  settingsToInputInit,
  type InputOptionsInit,
  type RenderOptionsInit,
} from "@/features/pbn-studio";
import { usePbnDetail } from "@/entities/order/api/usePbnDetail";
import { useSavePbnFlow, type SavedPbnRef } from "../model/useSavePbnFlow";
import { useStylePbnConfig } from "../model/useStylePbnConfig";
import {
  STOREFRONT_INITIAL_IMAGE,
  STOREFRONT_INPUT_DEFAULTS,
  STOREFRONT_RENDER_DEFAULTS,
} from "../model/defaults";
import DropZone from "./DropZone";
import CropModal from "./CropModal";
import Modal from "@/shared/ui/Modal";
import RenderOptionsPane from "./RenderOptionsPane";
import { PbnPostMenuItem } from "./PbnPostMenu";
import MixingGuide from "./MixingGuide";
import InputOptionsPane from "./InputOptionsPane";
import ProcessButtons from "./ProcessButtons";
import PbnSidebar from "./PbnSidebar";
import PbnImageStep from "./PbnImageStep";
import PbnSettingsDrawer from "./PbnSettingsDrawer";
import ExportControls from "./ExportControls";
import PbnResultView from "./PbnResultView";
import { card, stepTitle } from "@/features/pbn-studio/ui/pbnStyles";

// Al llegar desde "Enviar a PBN" (detalle de generación) traemos la imagen del
// artwork por query param para precargarla en el canvas; generationId liga el
// PBN guardado a esa generación (ver handleSave) y styleId trae el default PBN
// del estilo (Style.pbnConfig) con el que se seedean los paneles de opciones.
// Con `pbnId` (volver a un PBN ya guardado desde /user/pbn) el estudio se abre
// sobre ese PBN: imagen de origen, ajustes y el SVG persistido, sin reprocesar.
export default function Studio() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get("generationId");
  const initialImageUrl = searchParams.get("imageUrl");
  const styleId = searchParams.get("styleId");
  const pbnId = searchParams.get("pbnId");

  // Los hooks de opciones solo leen su init en el primer render, así que el
  // estudio no se monta hasta resolver los fetch (sin params resuelven al tiro).
  const { inputInit, renderInit, loading } = useStylePbnConfig(styleId);
  const { pbn, isLoading: pbnLoading } = usePbnDetail(pbnId);
  if (loading || pbnLoading) return null;

  // Sin sesión el fetch del PBN falla y `pbn` queda null: el estudio arranca
  // como siempre. La config del PBN pisa la del estilo, campo a campo.
  const savedPbn =
    pbn && pbn.outlineSvgUrl
      ? {
          id: pbn.id,
          previewUrl: pbn.previewUrl,
          outlineSvgUrl: pbn.outlineSvgUrl,
          palette: Array.isArray(pbn.config?.palette)
            ? (pbn.config.palette as RGB[])
            : undefined,
        }
      : null;

  return (
    <StudioLayout
      generationId={pbn?.generationId ?? generationId}
      initialImageUrl={
        pbn?.sourceImageUrl ?? initialImageUrl ?? STOREFRONT_INITIAL_IMAGE
      }
      inputInit={settingsToInputInit(pbn?.config?.input) ?? inputInit}
      renderInit={(pbn?.config?.render as RenderOptionsInit) ?? renderInit}
      savedPbn={savedPbn}
    />
  );
}

interface StudioSavedPbn extends SavedPbnRef {
  outlineSvgUrl: string;
  palette?: RGB[];
}

function StudioLayout({
  generationId,
  initialImageUrl,
  inputInit,
  renderInit,
  savedPbn,
}: {
  generationId: string | null;
  initialImageUrl: string | null;
  inputInit?: InputOptionsInit;
  renderInit?: RenderOptionsInit;
  savedPbn: StudioSavedPbn | null;
}) {
  const { log, clearLog } = useLog();

  // Keep the whole object so it can be handed to <PbnSidebar> as one prop; the
  // main preview area only needs the two refs below.
  const imageInput = useImageInput(log, initialImageUrl);
  const {
    inputCanvasRef,
    originalImageRef,
    fileInputRef,
    onFileChange,
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

  // `resetSaved` nace de useSavePbnFlow, que se declara más abajo porque
  // necesita el output del pipeline: se llama por ref para no invertir el orden.
  const resetSavedRef = useRef<(() => void) | null>(null);
  const onProcessStart = useCallback(() => {
    setRecipes(null);
    // drop the highlight tied to the palette that's about to be replaced
    setSelectedColor(null);
    // lo que se está regenerando ya no es el PBN con el que se abrió el estudio
    resetSavedRef.current?.();
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
    loadSaved,
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

  // Al abrir un PBN ya guardado (`/studio?pbnId=…`): inyecta el SVG persistido en
  // vez de reprocesar, una vez la imagen de origen está dibujada (así el
  // comparador puede rasterizar el SVG contra el original). Si la descarga falla
  // (p. ej. CORS) cae a regenerarlo. Mismo criterio que el estudio del admin.
  const didLoadSaved = useRef(false);
  useEffect(() => {
    if (!savedPbn || !imageSrc || didLoadSaved.current) return;
    didLoadSaved.current = true;
    void (async () => {
      const ok = await loadSaved(savedPbn.outlineSvgUrl, savedPbn.palette);
      if (!ok) {
        void process();
      } else if (ENABLE_MIXING_GUIDE && savedPbn.palette?.length) {
        void computeRecipes(savedPbn.palette);
      }
    })();
  }, [savedPbn, imageSrc, loadSaved, process, computeRecipes]);

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
  const {
    handleSave,
    ensureSaved,
    resetSaved,
    saving,
    savedId,
    saveError,
    savedPbn: savedRef,
  } = useSavePbnFlow({
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
      initialSavedPbn: savedPbn,
    });

  // Ver `resetSavedRef`: onProcessStart se define antes de este hook.
  useEffect(() => {
    resetSavedRef.current = resetSaved;
  }, [resetSaved]);

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
      // Abierto sobre un PBN de la cuenta y sin reprocesar todavía: guardar solo
      // crearía un duplicado idéntico. `resetSaved` (en onProcessStart) lo
      // devuelve en cuanto se regenera el resultado.
      hidden: !canSave || (!!savedRef && !savedId),
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
  // the grid. A single element is reused in both places — only one of the two is
  // ever rendered, so the step cards inside it are never mounted twice.
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
      {/* The one hidden file <input> for the whole studio. It lives here rather
          than in <PbnImageStep> because that card is mounted in some layouts and
          not others (mobile pre-result vs. the bottom sheet vs. the desktop
          sidebar), and openFilePicker() is a silent no-op whenever the input
          behind its ref happens to be unmounted. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/x-png,image/gif,image/jpeg"
        onChange={onFileChange}
        hidden
      />

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

          {/* Mobile, before there's a result: the bottom sheet only mounts once
              there is one, so the step cards sit inline under the preview
              instead — same order as the desktop sidebar. */}
          {isMobile && !showResult && (
            <div className="mt-4 flex flex-col gap-4">
              <PbnImageStep imageInput={imageInput} />
              <section className={card}>
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
            </div>
          )}
          {/* Imagen de Resultado */}
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
