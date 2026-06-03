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
  Collapsible,
  Spinner,
  Box,
  Divider,
} from "@shopify/polaris";
import { adminApi, EnhanceInfo, EnhanceOptions } from "@/entities/admin/api";
import ImagePreviewModal from "./ImagePreviewModal";

const TARGET_DPI = 150;

function autoPreset(info: EnhanceInfo | null): EnhanceOptions {
  return {
    upscale: info?.recommendedUpscale ?? 2,
    improve: true,
    sharpen: 60,
  };
}

function ImageBox({
  src,
  alt,
  onClick,
}: {
  src: string | null;
  alt: string;
  onClick?: () => void;
}) {
  if (!src) {
    return (
      <div
        style={{
          width: 200,
          height: 150,
          background: "#f6f6f7",
          border: "1px solid #e3e3e3",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text as="span" tone="subdued" variant="bodySm">
          Sin imagen
        </Text>
      </div>
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: "block" }}
    />
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Ver en grande"
        style={{ border: "none", background: "none", padding: 0, cursor: "zoom-in" }}
      >
        {img}
      </button>
    );
  }
  return img;
}

export default function EnhanceImageModal({
  orderId,
  itemId,
  onClose,
  onApplied,
}: {
  orderId: string;
  itemId: string;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [info, setInfo] = useState<EnhanceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [printDims, setPrintDims] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [options, setOptions] = useState<EnhanceOptions>({ upscale: 0 });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await adminApi.orders.enhanceInfo(orderId, itemId);
        if (active) setInfo(data);
      } catch (e) {
        if (active) setErr((e as Error).message);
      } finally {
        if (active) setLoadingInfo(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orderId, itemId]);

  const updateOption = useCallback(
    <K extends keyof EnhanceOptions>(key: K, value: EnhanceOptions[K]) => {
      setOptions((o) => ({ ...o, [key]: value }));
      setPreviewUrl(null); // stale preview no longer matches the options
    },
    [],
  );

  async function handlePreview() {
    setPreviewing(true);
    setErr(null);
    try {
      const res = await adminApi.orders.enhancePreview(orderId, itemId, options);
      setPreviewUrl(res.previewUrl);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPreviewing(false);
    }
  }

  async function applyWith(opts: EnhanceOptions) {
    setApplying(true);
    setErr(null);
    try {
      await adminApi.orders.enhance(orderId, itemId, opts);
      onApplied();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
      setApplying(false);
    }
  }

  async function handleRevert() {
    setReverting(true);
    setErr(null);
    try {
      await adminApi.orders.enhanceRevert(orderId, itemId);
      onApplied();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
      setReverting(false);
    }
  }

  const busy = applying || reverting;
  const dpi = info?.sourceDpi ?? null;
  const lowDpi = dpi !== null && dpi < TARGET_DPI;
  // Measure the DELIVERED print image (same file/method as PrintProofModal) so both
  // modals always agree on the real print DPI.
  const printDpi =
    printDims && info?.printInches
      ? Math.floor(
          Math.min(
            printDims.w / info.printInches.width,
            printDims.h / info.printInches.height,
          ),
        )
      : null;
  // The current print file is already print-ready — don't nag about the source DPI.
  const printReady =
    Boolean(info?.alreadyEnhanced) &&
    printDpi !== null &&
    printDpi >= TARGET_DPI;
  const hasSource = Boolean(info?.sourceUrl);
  const canEnhance = hasSource && !busy && !loadingInfo;

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
      title="Mejorar imagen para impresión"
      primaryAction={{
        content: "Aplicar y guardar",
        loading: applying,
        disabled: !canEnhance,
        onAction: () => applyWith(options),
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
          <BlockStack gap="400">
            {err && (
              <Banner tone="critical" onDismiss={() => setErr(null)}>
                {err}
              </Banner>
            )}

            {!hasSource && (
              <Banner tone="warning">
                Este item no tiene imagen de origen. Sube una con{" "}
                <strong>“Subir imagen”</strong> o vincula una generación antes de
                mejorar.
              </Banner>
            )}

            {/* Measure the delivered print image off-screen (same method as
                PrintProofModal) to compute the real print DPI. */}
            {info?.printImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={info.printImageUrl}
                alt=""
                aria-hidden
                onLoad={(e) =>
                  setPrintDims({
                    w: e.currentTarget.naturalWidth,
                    h: e.currentTarget.naturalHeight,
                  })
                }
                style={{ display: "none" }}
              />
            )}

            {/* Print-readiness */}
            {hasSource && info?.printInches && printReady ? (
              <Banner tone="success">
                Imagen ya mejorada a ~<strong>{printDpi} DPI</strong> para
                impresión de {info.printInches.width}″ × {info.printInches.height}
                ″{dpi !== null ? ` (origen ${dpi} DPI)` : ""}. No hace falta más
                upscale.
              </Banner>
            ) : hasSource && info?.printInches ? (
              <Banner
                tone={dpi === null ? "info" : lowDpi ? "warning" : "success"}
              >
                {dpi !== null ? (
                  <>
                    Resolución de origen ~<strong>{dpi} DPI</strong> para
                    impresión de {info.printInches.width}″ ×{" "}
                    {info.printInches.height}″
                    {lowDpi ? (
                      <>
                        {" "}
                        — por debajo de {TARGET_DPI} DPI. Recomendado:{" "}
                        <strong>
                          {info.recommendedUpscale > 0
                            ? `upscale ${info.recommendedUpscale}×`
                            : "sin upscale"}
                        </strong>
                        .
                      </>
                    ) : (
                      " — resolución suficiente para imprimir."
                    )}
                  </>
                ) : (
                  <>
                    No se pudo determinar la resolución de origen. Si la imagen
                    se ve pequeña, aplica un upscale antes de enviar.
                  </>
                )}
              </Banner>
            ) : null}

            {/* Before / after */}
            <InlineStack gap="400" align="start" wrap>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">
                  Original
                </Text>
                <ImageBox
                  src={info?.sourceUrl ?? null}
                  alt="Original"
                  onClick={
                    info?.sourceUrl
                      ? () => setZoom({ src: info.sourceUrl!, title: "Original" })
                      : undefined
                  }
                />
              </BlockStack>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">
                  {previewUrl
                    ? "Vista previa"
                    : info?.alreadyEnhanced
                      ? "Resultado actual"
                      : "Vista previa"}
                </Text>
                {(() => {
                  const previewSrc =
                    previewUrl ??
                    info?.printImageUrl ??
                    info?.sourceUrl ??
                    null;
                  return (
                    <ImageBox
                      src={previewSrc}
                      alt="Vista previa"
                      onClick={
                        previewSrc
                          ? () =>
                              setZoom({
                                src: previewSrc,
                                title: previewUrl
                                  ? "Vista previa"
                                  : "Resultado actual",
                              })
                          : undefined
                      }
                    />
                  );
                })()}
              </BlockStack>
            </InlineStack>
            <Text as="span" variant="bodySm" tone="subdued">
              La vista previa muestra los ajustes de color/nitidez. El upscale se
              aplica al guardar.
            </Text>

            <Button
              variant="primary"
              fullWidth
              loading={applying}
              disabled={!canEnhance}
              onClick={() => applyWith(autoPreset(info))}
            >
              ✨ Auto-mejorar
            </Button>

            <Divider />

            <Button
              variant="plain"
              disclosure={advancedOpen ? "up" : "down"}
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              Ajustes avanzados
            </Button>
            <Collapsible id="enhance-advanced" open={advancedOpen}>
              <BlockStack gap="300">
                <Select
                  label="Upscale (agrandar resolución)"
                  options={[
                    { label: "Sin upscale", value: "0" },
                    { label: "2×", value: "2" },
                    { label: "4×", value: "4" },
                  ]}
                  value={String(options.upscale ?? 0)}
                  onChange={(v) =>
                    updateOption("upscale", Number(v) as 0 | 2 | 4)
                  }
                />
                <RangeSlider
                  label="Nitidez"
                  min={0}
                  max={200}
                  step={10}
                  value={options.sharpen ?? 0}
                  onChange={(v) => updateOption("sharpen", v as number)}
                  output
                />
                <RangeSlider
                  label="Contraste"
                  min={-50}
                  max={100}
                  value={options.contrast ?? 0}
                  onChange={(v) => updateOption("contrast", v as number)}
                  output
                />
                <RangeSlider
                  label="Brillo"
                  min={-50}
                  max={100}
                  value={options.brightness ?? 0}
                  onChange={(v) => updateOption("brightness", v as number)}
                  output
                />
                <RangeSlider
                  label="Saturación"
                  min={-50}
                  max={100}
                  value={options.saturation ?? 0}
                  onChange={(v) => updateOption("saturation", v as number)}
                  output
                />
                <Checkbox
                  label="Mejora automática"
                  helpText="Auto-niveles: normaliza el rango tonal de la imagen."
                  checked={options.improve ?? false}
                  onChange={(v) => updateOption("improve", v)}
                />
                <Checkbox
                  label="Ajustar al formato (recorte centrado)"
                  helpText="Recorta la imagen al ratio exacto del producto para que Pictorem no la recorte."
                  checked={options.fitToFormat ?? false}
                  onChange={(v) => updateOption("fitToFormat", v)}
                />
                <Box>
                  <Button
                    onClick={handlePreview}
                    loading={previewing}
                    disabled={!canEnhance}
                  >
                    Previsualizar
                  </Button>
                </Box>
              </BlockStack>
            </Collapsible>

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
        )}
      </Modal.Section>
    </Modal>
    </>
  );
}
