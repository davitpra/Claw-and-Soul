"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RGB } from "@/lib/pbn/common";
import { buildHighlightOverlayDataUrl } from "@/lib/pbn/highlight";
import { getPaperAspect } from "@/lib/pbn/svgExport";
import { PAPER_LABELS, ENABLE_MIXING_GUIDE } from "./model/constants";
import { adminApi, type PbnConfig } from "@/entities/admin/api";
import { useLog } from "./model/useLog";
import { useImageInput } from "./model/useImageInput";
import { useInputOptions, InputOptionsInit } from "./model/useInputOptions";
import { useRenderOptions, RenderOptionsInit } from "./model/useRenderOptions";
import { usePaintMixing } from "./model/usePaintMixing";
import { useProcessing } from "./model/useProcessing";
import { useExport } from "./model/useExport";
import { useSaveToOrder } from "./model/useSaveToOrder";
import {
  btnPrimary,
  btnSecondary,
  card,
  stepNum,
  stepTitle,
} from "./ui/pbnStyles";
import CropModal from "./ui/CropModal";
import ImageCompareSlider from "./ui/ImageCompareSlider";
import InputOptionsPane from "./ui/InputOptionsPane";
import ProgressBar from "./ui/ProgressBar";
import RenderOptionsPane from "./ui/RenderOptionsPane";
import MixingGuide from "./ui/MixingGuide";
import ExportControls from "./ui/ExportControls";

type AdminPbnStudioProps = {
  // URL para precargar en el canvas en vez del ejemplo por defecto (la imagen
  // generada del item del pedido).
  initialImageSrc?: string;
  // Pedido/item al que se guardará el PBN. Si se pasan, aparece el botón
  // "Guardar en el pedido" (persiste + enlaza el PBN al OrderItem).
  orderId?: string;
  itemId?: string;
  onSaved?: () => void;
  // Estilo de la generación del item. Si se pasa, aparece "Guardar como default
  // del estilo": persiste los ajustes actuales (input+render) en Style.pbnConfig
  // para que el estudio público arranque con ellos.
  styleTarget?: { id: string; displayName: string };
  // Config con la que sembrar los paneles (p. ej. el `pbnConfig` actual del
  // estilo) sin activar la lógica de `savedPbn` (banner + auto-carga del SVG).
  // Si también viene `savedPbn`, su config tiene prioridad.
  configInit?: PbnConfig;
  // PBN ya guardado en el item: precarga ajustes + imagen fuente + SVG guardado.
  savedPbn?: {
    config?: PbnConfig;
    sourceImageUrl?: string | null;
    outlineSvgUrl?: string | null;
  };
};

// Versión ADMIN, autónoma y editable, del flujo Paint by Numbers. Toda la capa
// (hooks del pipeline en ./model y paneles de UI en ./ui) vive aquí dentro, copiada
// del widget del storefront, para poder añadir o quitar pasos del PBN sin tocar la
// página pública. La única dependencia compartida son los algoritmos de `@/lib/pbn`.
// La salida es solo descarga (no persiste en el pedido).
export default function AdminPbnStudio({
  initialImageSrc,
  orderId,
  itemId,
  onSaved,
  styleTarget,
  configInit,
  savedPbn,
}: AdminPbnStudioProps) {
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
  } = useImageInput(log, savedPbn?.sourceImageUrl ?? initialImageSrc);

  const inputOptions = useInputOptions(
    (savedPbn?.config?.input ?? configInit?.input) as
      | InputOptionsInit
      | undefined,
  );
  const renderOptions = useRenderOptions(
    (savedPbn?.config?.render ?? configInit?.render) as
      | RenderOptionsInit
      | undefined,
  );
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

  // Overlay que resalta las secciones del color seleccionado sobre el resultado.
  // Se reconstruye al cambiar el color, la paleta (reproceso) o las opciones de
  // borde/etiqueta para que el overlay las siga. Si el PBN se abrió desde el SVG
  // guardado no hay facetResult, así que devuelve undefined (no resalta hasta
  // reprocesar).
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

  // Al reabrir un PBN guardado: **lee el SVG guardado** (no reprocesa) una vez la
  // imagen fuente ya está dibujada (imageSrc deja de ser null, así el compare-
  // slider puede rasterizar el SVG contra el original). Si la carga falla (p. ej.
  // CORS), cae a reprocesar. También recalcula las recetas de la guía de mezcla.
  const didLoadSaved = useRef(false);
  useEffect(() => {
    if (!savedPbn || !imageSrc || didLoadSaved.current) return;
    didLoadSaved.current = true;
    void (async () => {
      const savedPalette = savedPbn.config?.palette as RGB[] | undefined;
      const ok = savedPbn.outlineSvgUrl
        ? await loadSaved(savedPbn.outlineSvgUrl, savedPalette)
        : false;
      if (ok) {
        if (ENABLE_MIXING_GUIDE && savedPalette?.length) {
          void computeRecipes(savedPalette);
        }
      } else {
        void process(); // fallback: regenerar desde la imagen + ajustes
      }
    })();
  }, [savedPbn, imageSrc, loadSaved, process, computeRecipes]);

  // ---- Guardar en el pedido ----
  const { save, saving, savedOk, error: saveError } = useSaveToOrder();
  const canSaveToOrder = Boolean(orderId && itemId);

  const handleSaveToOrder = useCallback(() => {
    if (!orderId || !itemId) return;
    void save({
      orderId,
      itemId,
      svgContainerRef,
      guideRef,
      previewDataUrl: compareImgs?.processed,
      sourceDataUrl: originalImageRef.current,
      palette,
      recipes,
      config: {
        // Valores crudos del hook (no `buildSettings()`) para poder rehidratar
        // los paneles tal cual al reabrir el PBN guardado.
        input: {
          resizeImage: inputOptions.resizeImage,
          resizeWidth: inputOptions.resizeWidth,
          resizeHeight: inputOptions.resizeHeight,
          nrOfClusters: inputOptions.nrOfClusters,
          clusterPrecision: inputOptions.clusterPrecision,
          randomSeed: inputOptions.randomSeed,
          colorSpace: inputOptions.colorSpace,
          colorRestrictions: inputOptions.colorRestrictions,
          pickedColors: inputOptions.pickedColors,
          paletteMode: inputOptions.paletteMode,
          narrowPixelCleanupRuns: inputOptions.narrowPixelCleanupRuns,
          removeFacetsSmallerThan: inputOptions.removeFacetsSmallerThan,
          maximumNumberOfFacets: inputOptions.maximumNumberOfFacets,
          largeToSmall: inputOptions.largeToSmall,
          halveBorderSegments: inputOptions.halveBorderSegments,
        },
        render: {
          showLabels: renderOptions.showLabels,
          fillFacets: renderOptions.fillFacets,
          showBorders: renderOptions.showBorders,
          sizeMultiplier: renderOptions.sizeMultiplier,
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
    }).then((saved) => {
      if (saved) onSaved?.();
    });
  }, [
    orderId,
    itemId,
    save,
    svgContainerRef,
    guideRef,
    compareImgs,
    originalImageRef,
    palette,
    recipes,
    inputOptions,
    renderOptions,
    exp,
    onSaved,
  ]);

  // ---- Guardar como default del estilo ----
  const [savingStyleDefault, setSavingStyleDefault] = useState(false);
  const [styleDefaultOk, setStyleDefaultOk] = useState(false);
  const [styleDefaultError, setStyleDefaultError] = useState<string | null>(
    null,
  );

  const handleSaveAsStyleDefault = useCallback(() => {
    if (!styleTarget) return;
    setSavingStyleDefault(true);
    setStyleDefaultOk(false);
    setStyleDefaultError(null);
    adminApi.styles
      .update(styleTarget.id, {
        pbnConfig: {
          // Mismos valores crudos que el config del PBN guardado, pero sin
          // `paper` ni `pickedColors`: el papel lo elige el cliente y los
          // colores pineados son específicos de esta imagen, no del estilo.
          input: {
            resizeImage: inputOptions.resizeImage,
            resizeWidth: inputOptions.resizeWidth,
            resizeHeight: inputOptions.resizeHeight,
            nrOfClusters: inputOptions.nrOfClusters,
            clusterPrecision: inputOptions.clusterPrecision,
            randomSeed: inputOptions.randomSeed,
            colorSpace: inputOptions.colorSpace,
            colorRestrictions: inputOptions.colorRestrictions,
            paletteMode: inputOptions.paletteMode,
            narrowPixelCleanupRuns: inputOptions.narrowPixelCleanupRuns,
            removeFacetsSmallerThan: inputOptions.removeFacetsSmallerThan,
            maximumNumberOfFacets: inputOptions.maximumNumberOfFacets,
            largeToSmall: inputOptions.largeToSmall,
            halveBorderSegments: inputOptions.halveBorderSegments,
          },
          render: {
            showLabels: renderOptions.showLabels,
            fillFacets: renderOptions.fillFacets,
            showBorders: renderOptions.showBorders,
            sizeMultiplier: renderOptions.sizeMultiplier,
            labelFontSize: renderOptions.labelFontSize,
            labelFontColor: renderOptions.labelFontColor,
            fillOpacity: renderOptions.fillOpacity,
          },
        },
      })
      .then(() => setStyleDefaultOk(true))
      .catch((e: unknown) =>
        setStyleDefaultError(
          e instanceof Error ? e.message : "No se pudo guardar la configuración",
        ),
      )
      .finally(() => setSavingStyleDefault(false));
  }, [styleTarget, inputOptions, renderOptions]);

  const showResult = !!compareImgs && !isProcessing;

  return (
    <>
      {savedPbn && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 font-body text-sm text-slate-dark">
          <span className="material-symbols-outlined text-[18px] text-primary">
            history
          </span>
          Mostrando el PBN guardado. Pulsa &quot;Procesar imagen&quot; para
          regenerarlo con ajustes distintos.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---- Sidebar: numbered step cards ---- */}
        <aside className="flex flex-col gap-6">
          {/* Step 1: Imagen a convertir */}
          <section className={card}>
            <h3 className={stepTitle}>
              <span className={stepNum}>1</span>
              Imagen a convertir
            </h3>
            <p className="mt-2 font-body text-sm text-text-muted">
              {orderId
                ? "Se precarga la imagen generada del pedido. Puedes reemplazarla."
                : "Se precarga la imagen de referencia. Puedes reemplazarla."}
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
                    alt="Vista previa de la imagen"
                    className="mx-auto max-h-52 w-auto rounded-lg"
                  />
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 font-body text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Click o arrastra para reemplazar
                  </span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-primary">
                    upload_file
                  </span>
                  <span className="font-body text-sm text-slate-dark">
                    Arrastra una imagen aquí, o{" "}
                    <strong>haz click para buscar</strong>
                  </span>
                  <span className="font-body text-xs text-text-muted">
                    Pega desde el portapapeles (Ctrl+V) · PNG, JPG o GIF
                  </span>
                </>
              )}
            </button>
          </section>

          {/* Step 2: Ajustes de imagen */}
          <section className={card}>
            <h3 className={`${stepTitle} mb-4`}>
              <span className={stepNum}>2</span>
              Ajustes de imagen
            </h3>
            <InputOptionsPane opts={inputOptions} imageSrc={imageSrc} />
          </section>
        </aside>

        {/* ---- Main: preview area ---- */}
        <main className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <strong className="font-display font-black text-slate-dark">
              Vista previa
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
                  Procesando...
                </>
              ) : (
                "Procesar imagen"
              )}
            </button>
            {isProcessing && (
              <button className={btnSecondary} onClick={cancel}>
                Cancelar
              </button>
            )}
          </div>

          <ProgressBar overall={overall} />

          <div className="relative max-w-3/4 mx-auto">
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
                highlightSrc={highlightSrc}
                leftLabel="Original"
                rightLabel="Resultado"
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
              selectedColor={selectedColor}
              onSelectColor={(i) =>
                setSelectedColor((prev) => (prev === i ? null : i))
              }
            />
          )}

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
                      aria-label="Cerrar"
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
                className="pointer-events-none absolute -left-2499.75 top-0"
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className={stepTitle}>
                <span className={stepNum}>3</span>
                Guardar y descargar
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {styleTarget && hasOutput && (
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={handleSaveAsStyleDefault}
                    disabled={savingStyleDefault || isProcessing}
                  >
                    {savingStyleDefault ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                          progress_activity
                        </span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">
                          {styleDefaultOk ? "check_circle" : "palette"}
                        </span>
                        {styleDefaultOk
                          ? "Default guardado"
                          : `Guardar como default de "${styleTarget.displayName}"`}
                      </>
                    )}
                  </button>
                )}
              {canSaveToOrder && hasOutput && (
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={handleSaveToOrder}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        {savedOk ? "check_circle" : "save"}
                      </span>
                      {savedOk ? "Guardado" : "Guardar en el pedido"}
                    </>
                  )}
                </button>
              )}
              </div>
            </div>
            {styleDefaultOk && styleTarget && (
              <p className="mt-2 font-body text-sm text-green-700">
                Configuración guardada como default del estilo &quot;
                {styleTarget.displayName}&quot;: el estudio público la usará al
                llegar desde una generación de ese estilo.
              </p>
            )}
            {styleDefaultError && (
              <p className="mt-2 font-body text-sm text-red-600">
                {styleDefaultError}
              </p>
            )}
            {savedOk && (
              <p className="mt-2 font-body text-sm text-green-700">
                Paint by Numbers guardado y enlazado a este item del pedido.
              </p>
            )}
            {saveError && (
              <p className="mt-2 font-body text-sm text-red-600">{saveError}</p>
            )}
            <div className="mt-4">
              <ExportControls exp={exp} hasOutput={hasOutput} />
            </div>
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
        {/* SVG container: kept mounted so the pipeline can write into it and
            export can read from it, but never shown to the user */}
        <div
          ref={svgContainerRef}
          className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
        />
      </div>
    </>
  );
}
