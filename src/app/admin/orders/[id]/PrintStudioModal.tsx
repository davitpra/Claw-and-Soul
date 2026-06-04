"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Button,
  Select,
  RangeSlider,
  Checkbox,
  Spinner,
  Box,
  Divider,
  Badge,
  ColorPicker,
} from "@shopify/polaris";
import { adminApi, AdminOrderItem, EnhanceInfo, EnhanceOptions } from "@/entities/admin/api";
import { hexToHsb, hsbToHex, HsbColor } from "@/lib/colorUtils";
import ImagePreviewModal from "./ImagePreviewModal";

const GOOD_DPI = 300;
const LOW_DPI = 200;
const DEFAULT_UPSCALE_FACTOR = 2;

function dpiTone(dpi: number | null): "success" | "warning" | "critical" {
  if (dpi === null || dpi < LOW_DPI) return "critical";
  if (dpi < GOOD_DPI) return "warning";
  return "success";
}

export default function PrintStudioModal({
  orderId,
  item,
  onClose,
  onApplied,
}: {
  orderId: string;
  item: AdminOrderItem;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [info, setInfo] = useState<EnhanceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // URL of the enhanced image after a successful save — shown in the stage so the
  // admin sees the result without reopening the modal.
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ src: string; title: string } | null>(null);
  const [measuredPx, setMeasuredPx] = useState<{ w: number; h: number } | null>(null);

  // Controls
  const [upscaleFactor, setUpscaleFactor] = useState(DEFAULT_UPSCALE_FACTOR);
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [sharpen, setSharpen] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [improve, setImprove] = useState(false);
  const [fitToFormat, setFitToFormat] = useState(false);
  const [bleedEnabled, setBleedEnabled] = useState(false);
  const [bleedColor, setBleedColor] = useState("#ffffff");
  const [bleedHsb, setBleedHsb] = useState<HsbColor>({
    hue: 0,
    saturation: 0,
    brightness: 1,
  });
  const [showGuides, setShowGuides] = useState(true);

  // The current image to display (before any backend preview)
  const sourceUrl =
    item.printImageUrl ?? item.generation?.resultUrl ?? item.imageUrl ?? null;
  const displayUrl = previewUrl ?? savedUrl ?? info?.printImageUrl ?? sourceUrl;
  // Full-res current print image (excludes the 900px backend preview) — used for
  // client-side dimension measurement and zoom.
  const currentImageUrl = savedUrl ?? info?.printImageUrl ?? sourceUrl;

  useEffect(() => {
    let active = true;
    const firstLoad = !info;
    (async () => {
      try {
        const data = await adminApi.orders.enhanceInfo(orderId, item.id);
        if (!active) return;
        setInfo(data);
        // Only initialize controls on first load — subsequent refreshes (triggered
        // by parent updating item.printImageUrl after save) just update the image URL.
        if (firstLoad) {
          if (data.bleedColor) {
            setBleedColor(data.bleedColor);
            setBleedHsb(hexToHsb(data.bleedColor));
          }
          // Only suggest enhancements when the image hasn't been enhanced yet.
          if (!data.alreadyEnhanced) {
            if (data.sourceDpi !== null && data.sourceDpi < GOOD_DPI) {
              setImprove(true);
              setSharpen(60);
            }
            if (data.recommendedUpscale > 0) {
              setUpscaleFactor(data.recommendedUpscale);
            }
          }
        }
      } catch (e) {
        if (active) setErr((e as Error).message);
      } finally {
        if (active) setLoadingInfo(false);
      }
    })();
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, item.id, item.printImageUrl]);

  // Reset measured dimensions when the current image URL changes.
  useEffect(() => {
    setMeasuredPx(null);
  }, [currentImageUrl]);

  const invalidatePreview = useCallback(() => {
    setPreviewUrl(null);
    setSavedOk(false);
  }, []);

  function updateBleedColor(hsb: HsbColor) {
    setBleedHsb(hsb);
    setBleedColor(hsbToHex(hsb));
    invalidatePreview();
  }

  const busy = applying || reverting;
  const hasSource = Boolean(info?.sourceUrl);
  const canAct = hasSource && !busy && !loadingInfo;
  const printInches = info?.printInches ?? null;

  // CSS filter for live brightness/contrast/saturation preview
  const cssFilter =
    [
      brightness !== 0 ? `brightness(${1 + brightness / 100})` : "",
      contrast !== 0 ? `contrast(${1 + contrast / 100})` : "",
      saturation !== 0 ? `saturate(${1 + saturation / 100})` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  // DPI of the current print image as measured client-side from the delivered URL.
  const currentDpi =
    measuredPx && printInches
      ? Math.floor(
          Math.min(
            measuredPx.w / printInches.width,
            measuredPx.h / printInches.height,
          ),
        )
      : null;

  // Theoretical target pixel size and DPI after upscale (computed client-side,
  // no backend call needed — upscale only runs on save).
  const targetPx =
    info?.sourcePx && upscaleFactor > 1
      ? {
          w: Math.round(info.sourcePx.width * upscaleFactor),
          h: Math.round(info.sourcePx.height * upscaleFactor),
        }
      : info?.sourcePx
        ? { w: info.sourcePx.width, h: info.sourcePx.height }
        : null;
  const theoreticalDpi =
    targetPx && printInches
      ? Math.floor(
          Math.min(
            targetPx.w / printInches.width,
            targetPx.h / printInches.height,
          ),
        )
      : null;

  // ── Print guide geometry ────────────────────────────────────────────────
  // The stage container always includes the 3mm bleed on each side.
  // Total size in mm = printMm + 6; guide positions expressed as % of total.
  const printMmW = printInches ? printInches.width * 25.4 : null;
  const printMmH = printInches ? printInches.height * 25.4 : null;
  const totalMmW = printMmW !== null ? printMmW + 6 : null;
  const totalMmH = printMmH !== null ? printMmH + 6 : null;

  // Cut line = 3mm from the outer edge
  const cutInsetW = totalMmW ? (3 / totalMmW) * 100 : 0;
  const cutInsetH = totalMmH ? (3 / totalMmH) * 100 : 0;
  // Safe zone = 13mm from outer edge (3mm bleed + 10mm safety margin)
  const safeInsetW = totalMmW ? (13 / totalMmW) * 100 : 0;
  const safeInsetH = totalMmH ? (13 / totalMmH) * 100 : 0;

  // Stage aspect ratio: total including bleed
  const stageAspect =
    totalMmW && totalMmH
      ? `${totalMmW} / ${totalMmH}`
      : printInches
        ? `${printInches.width} / ${printInches.height}`
        : "1 / 1";

  // ── Actions ──────────────────────────────────────────────────────────────

  async function handlePreviewExact() {
    setPreviewing(true);
    setErr(null);
    try {
      const opts: EnhanceOptions = {
        sharpen: sharpen || undefined,
        contrast: contrast || undefined,
        brightness: brightness || undefined,
        saturation: saturation || undefined,
        improve: improve || undefined,
        fitToFormat: fitToFormat || undefined,
        format,
      };
      const res = await adminApi.orders.enhancePreview(orderId, item.id, opts);
      setPreviewUrl(res.previewUrl);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSave() {
    setApplying(true);
    setErr(null);
    try {
      const opts: EnhanceOptions = {
        upscaleFactor: upscaleFactor > 1 ? upscaleFactor : undefined,
        sharpen: sharpen || undefined,
        contrast: contrast || undefined,
        brightness: brightness || undefined,
        saturation: saturation || undefined,
        improve: improve || undefined,
        fitToFormat: fitToFormat || undefined,
        bleed: bleedEnabled || undefined,
        bleedColor: bleedEnabled ? bleedColor : undefined,
        format,
      };
      const { printImageUrl } = await adminApi.orders.enhance(
        orderId,
        item.id,
        opts,
      );
      // Update info optimistically so displayUrl shows the new image immediately
      // even before the parent reloads — avoids flash of old image on reopen.
      setInfo((prev) =>
        prev ? { ...prev, printImageUrl, alreadyEnhanced: true } : prev,
      );
      setPreviewUrl(null);
      setSavedUrl(printImageUrl);
      setSavedOk(true);
      onApplied();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setApplying(false);
    }
  }

  async function handleRevert() {
    setReverting(true);
    setErr(null);
    try {
      await adminApi.orders.enhanceRevert(orderId, item.id);
      onApplied();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
      setReverting(false);
    }
  }

  return (
    <>
      {zoom && (
        <ImagePreviewModal
          src={zoom.src}
          title={zoom.title}
          onClose={() => setZoom(null)}
        />
      )}
      <Modal
        open
        onClose={onClose}
        title="Estudio de impresión"
        size="large"
        primaryAction={{
          content: "Guardar",
          loading: applying,
          disabled: !canAct,
          onAction: handleSave,
        }}
        secondaryActions={[
          { content: "Cancelar", onAction: onClose, disabled: busy },
        ]}
      >
        <Modal.Section>
          {loadingInfo ? (
            <InlineStack align="center" gap="200">
              <Spinner size="small" />
              <Text as="span" tone="subdued">
                Analizando imagen…
              </Text>
            </InlineStack>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
              }}
            >
              {/* Hidden image to measure the real delivered dimensions of the current master */}
              {currentImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImageUrl}
                  alt=""
                  aria-hidden
                  style={{ display: "none" }}
                  onLoad={(e) =>
                    setMeasuredPx({
                      w: e.currentTarget.naturalWidth,
                      h: e.currentTarget.naturalHeight,
                    })
                  }
                />
              )}

              {/* ── LEFT: image stage ───────────────────────────────────── */}
              <div style={{ flexShrink: 0, width: 380 }}>
                <BlockStack gap="200" inlineAlign="center">
                  {/* Stage container — always sized to format + 3mm bleed */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: stageAspect,
                      background: bleedEnabled ? bleedColor : "#ebebeb",
                      borderRadius: 6,
                      border: "1px solid #c9cccf",
                      overflow: "hidden",
                    }}
                  >
                    {/* Image fills the format area (inset by cut-line %) */}
                    {displayUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayUrl}
                        alt="Vista de impresión"
                        style={{
                          position: "absolute",
                          top: `${cutInsetH}%`,
                          left: `${cutInsetW}%`,
                          width: `${100 - 2 * cutInsetW}%`,
                          height: `${100 - 2 * cutInsetH}%`,
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                          filter: cssFilter,
                        }}
                      />
                    )}
                    {!displayUrl && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text as="span" tone="subdued" variant="bodySm">
                          Sin imagen
                        </Text>
                      </div>
                    )}

                    {/* Guides overlay */}
                    {showGuides && printInches && (
                      <>
                        {/* Cut line — red dashed (= format/trim edge) */}
                        <div
                          style={{
                            position: "absolute",
                            top: `${cutInsetH}%`,
                            left: `${cutInsetW}%`,
                            right: `${cutInsetW}%`,
                            bottom: `${cutInsetH}%`,
                            border: "1.5px dashed rgba(220,38,38,0.9)",
                            pointerEvents: "none",
                          }}
                        />
                        {/* Safe zone — blue dashed (10mm inside the cut) */}
                        <div
                          style={{
                            position: "absolute",
                            top: `${safeInsetH}%`,
                            left: `${safeInsetW}%`,
                            right: `${safeInsetW}%`,
                            bottom: `${safeInsetH}%`,
                            border: "1.5px dashed rgba(37,99,235,0.85)",
                            pointerEvents: "none",
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Guide legend */}
                  {showGuides && printInches && (
                    <InlineStack gap="300" align="center" wrap>
                      <InlineStack gap="100" blockAlign="center">
                        <div
                          style={{
                            width: 18,
                            height: 0,
                            borderTop: "1.5px dashed #c9cccf",
                          }}
                        />
                        <Text as="span" variant="bodySm" tone="subdued">
                          Bleed
                        </Text>
                      </InlineStack>
                      <InlineStack gap="100" blockAlign="center">
                        <div
                          style={{
                            width: 18,
                            height: 0,
                            borderTop: "1.5px dashed rgba(220,38,38,0.9)",
                          }}
                        />
                        <Text as="span" variant="bodySm" tone="subdued">
                          Corte
                        </Text>
                      </InlineStack>
                      <InlineStack gap="100" blockAlign="center">
                        <div
                          style={{
                            width: 18,
                            height: 0,
                            borderTop: "1.5px dashed rgba(37,99,235,0.85)",
                          }}
                        />
                        <Text as="span" variant="bodySm" tone="subdued">
                          Zona segura
                        </Text>
                      </InlineStack>
                    </InlineStack>
                  )}

                  {previewUrl && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      Vista previa (aprox.) — el archivo guardado no cambia hasta
                      pulsar Guardar.
                    </Text>
                  )}

                  {/* Info bar — current print image dimensions + DPI + print size */}
                  <InlineStack gap="300" blockAlign="center" wrap>
                    {measuredPx ? (
                      <>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {measuredPx.w} × {measuredPx.h} px
                        </Text>
                        {currentDpi !== null && (
                          <Badge tone={dpiTone(currentDpi)}>
                            {`${currentDpi} DPI`}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Text as="span" variant="bodySm" tone="subdued">
                        {info?.sourcePx
                          ? `${info.sourcePx.width} × ${info.sourcePx.height} px`
                          : "— × — px"}
                      </Text>
                    )}
                    {printInches && (
                      <Text as="span" variant="bodySm" tone="subdued">
                        {printInches.width}″ × {printInches.height}″
                      </Text>
                    )}
                  </InlineStack>
                  {measuredPx && info?.sourcePx &&
                    (measuredPx.w !== info.sourcePx.width || measuredPx.h !== info.sourcePx.height) && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      Origen: {info.sourcePx.width} × {info.sourcePx.height} px
                    </Text>
                  )}

                  {info?.printImageUrl && (
                    <Button
                      variant="plain"
                      onClick={() =>
                        setZoom({
                          src: info.printImageUrl!,
                          title: "Imagen guardada",
                        })
                      }
                    >
                      Abrir original →
                    </Button>
                  )}
                </BlockStack>
              </div>

              {/* Vertical divider */}
              <div
                style={{
                  alignSelf: "stretch",
                  width: 1,
                  background: "#e3e3e3",
                  flexShrink: 0,
                }}
              />

              {/* ── RIGHT: controls ─────────────────────────────────────── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <BlockStack gap="400">
                  {err && (
                    <Banner tone="critical" onDismiss={() => setErr(null)}>
                      {err}
                    </Banner>
                  )}

                  {savedOk && (
                    <Banner tone="success" onDismiss={() => setSavedOk(false)}>
                      Imagen actualizada y guardada.
                    </Banner>
                  )}

                  {!hasSource && (
                    <Banner tone="warning">
                      Sin imagen de origen. Sube o vincula una imagen primero.
                    </Banner>
                  )}

                  {currentDpi !== null && printInches && (
                    <Banner tone={dpiTone(currentDpi)}>
                      {currentDpi >= GOOD_DPI ? (
                        <>
                          Imagen lista: <strong>{currentDpi} DPI</strong> para{" "}
                          {printInches.width}″ × {printInches.height}″
                        </>
                      ) : (
                        <>
                          Resolución actual:{" "}
                          <strong>{currentDpi} DPI</strong> para{" "}
                          {printInches.width}″ × {printInches.height}″
                          {` — bajo el mínimo. Se recomienda upscale.`}
                        </>
                      )}
                    </Banner>
                  )}
                  {currentDpi === null &&
                    info?.sourceDpi !== null &&
                    info?.sourceDpi !== undefined &&
                    printInches && (
                      <Banner
                        tone={
                          info.sourceDpi < GOOD_DPI ? "warning" : "success"
                        }
                      >
                        Resolución origen:{" "}
                        <strong>{info.sourceDpi} DPI</strong> para{" "}
                        {printInches.width}″ × {printInches.height}″
                        {info.sourceDpi < GOOD_DPI &&
                          ` — bajo el mínimo. Se recomienda upscale.`}
                      </Banner>
                    )}

                  {/* Upscale section */}
                  <BlockStack gap="200">
                    <Text as="p" variant="headingSm">
                      Upscale con IA
                    </Text>
                    <RangeSlider
                      label="Factor de upscale"
                      min={1}
                      max={8}
                      step={0.5}
                      value={upscaleFactor}
                      onChange={(v) => {
                        setUpscaleFactor(v as number);
                        invalidatePreview();
                      }}
                      output
                    />
                    <InlineStack gap="300" blockAlign="center" wrap>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {targetPx
                          ? `Tamaño objetivo: ${targetPx.w} × ${targetPx.h} px`
                          : "Tamaño objetivo: —"}
                      </Text>
                      <Badge tone={dpiTone(theoreticalDpi)}>
                        {theoreticalDpi !== null
                          ? `${theoreticalDpi} DPI (teórico)`
                          : "DPI —"}
                      </Badge>
                    </InlineStack>
                    <Text as="span" variant="bodySm" tone="subdued">
                      El upscale real se aplica al guardar.
                    </Text>
                  </BlockStack>

                  <Divider />

                  {/* Sharp adjustments */}
                  <BlockStack gap="300">
                    <Text as="p" variant="headingSm">
                      Ajustes de imagen
                    </Text>
                    <RangeSlider
                      label="Brillo"
                      min={-50}
                      max={100}
                      value={brightness}
                      onChange={(v) => {
                        setBrightness(v as number);
                        invalidatePreview();
                      }}
                      output
                    />
                    <RangeSlider
                      label="Contraste"
                      min={-50}
                      max={100}
                      value={contrast}
                      onChange={(v) => {
                        setContrast(v as number);
                        invalidatePreview();
                      }}
                      output
                    />
                    <RangeSlider
                      label="Saturación"
                      min={-50}
                      max={100}
                      value={saturation}
                      onChange={(v) => {
                        setSaturation(v as number);
                        invalidatePreview();
                      }}
                      output
                    />
                    <RangeSlider
                      label="Nitidez"
                      min={0}
                      max={200}
                      step={10}
                      value={sharpen}
                      onChange={(v) => {
                        setSharpen(v as number);
                        invalidatePreview();
                      }}
                      output
                    />
                    <Checkbox
                      label="Mejora automática"
                      helpText="Auto-niveles: normaliza el rango tonal."
                      checked={improve}
                      onChange={(v) => {
                        setImprove(v);
                        invalidatePreview();
                      }}
                    />
                    <Checkbox
                      label="Ajustar al formato (recorte centrado)"
                      helpText="Recorta al ratio exacto del producto para evitar recortes de Pictorem."
                      checked={fitToFormat}
                      onChange={(v) => {
                        setFitToFormat(v);
                        invalidatePreview();
                      }}
                    />
                    <Box>
                      <Button
                        loading={previewing}
                        disabled={!canAct}
                        onClick={handlePreviewExact}
                      >
                        Previsualizar exacto
                      </Button>
                    </Box>
                  </BlockStack>

                  <Divider />

                  {/* Bleed */}
                  <BlockStack gap="300">
                    <Checkbox
                      label="Añadir bleed 3 mm"
                      helpText="Extiende el fondo 3 mm en cada lado para sangrado POD."
                      checked={bleedEnabled}
                      onChange={(v) => {
                        setBleedEnabled(v);
                        invalidatePreview();
                      }}
                    />
                    {bleedEnabled && (
                      <BlockStack gap="200">
                        <Text as="span" variant="bodySm">
                          Color de fondo del bleed
                        </Text>
                        <ColorPicker
                          color={bleedHsb}
                          onChange={updateBleedColor}
                          allowAlpha={false}
                        />
                        <Text as="span" variant="bodySm" tone="subdued">
                          {bleedColor}
                        </Text>
                      </BlockStack>
                    )}
                  </BlockStack>

                  <Divider />

                  {/* Output options */}
                  <BlockStack gap="200">
                    <Checkbox
                      label="Mostrar guías de impresión"
                      checked={showGuides}
                      onChange={setShowGuides}
                    />
                    <Select
                      label="Formato de salida"
                      options={[
                        { label: "JPEG (recomendado)", value: "jpeg" },
                        { label: "PNG (sin pérdida)", value: "png" },
                      ]}
                      value={format}
                      onChange={(v) => {
                        setFormat(v as "jpeg" | "png");
                        invalidatePreview();
                      }}
                    />
                  </BlockStack>

                  {info?.alreadyEnhanced && (
                    <>
                      <Divider />
                      <Button
                        variant="plain"
                        tone="critical"
                        loading={reverting}
                        disabled={busy}
                        onClick={handleRevert}
                      >
                        Revertir al original
                      </Button>
                    </>
                  )}
                </BlockStack>
              </div>
            </div>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
}
