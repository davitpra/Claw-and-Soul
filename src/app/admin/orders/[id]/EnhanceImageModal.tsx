"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Button,
  ButtonGroup,
  Select,
  RangeSlider,
  Checkbox,
  Collapsible,
  Spinner,
  Box,
  Divider,
} from "@shopify/polaris";
import { adminApi, EnhanceInfo, EnhanceOptions } from "@/entities/admin/api";

const TARGET_DPI = 150;

type Engine = "cloudinary" | "sharp";

function autoPreset(info: EnhanceInfo | null, engine: Engine): EnhanceOptions {
  return {
    engine,
    upscale: info?.recommendedUpscale ?? 2,
    improve: true,
    sharpen: 60,
    autoColor: true,
  };
}

function ImageBox({ src, alt }: { src: string | null; alt: string }) {
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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
    />
  );
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
  const [engine, setEngine] = useState<Engine>("sharp");
  const [options, setOptions] = useState<EnhanceOptions>({ upscale: 0 });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  function changeEngine(next: Engine) {
    setEngine(next);
    setPreviewUrl(null);
  }

  async function handlePreview() {
    setPreviewing(true);
    setErr(null);
    try {
      const res = await adminApi.orders.enhancePreview(orderId, itemId, {
        ...options,
        engine,
      });
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
  const dpi = info?.currentDpi ?? null;
  const lowDpi = dpi !== null && dpi < TARGET_DPI;
  const hasSource = Boolean(info?.sourceUrl);
  const canEnhance = hasSource && !busy && !loadingInfo;

  return (
    <Modal
      open
      onClose={onClose}
      title="Mejorar imagen para impresión"
      primaryAction={{
        content: "Aplicar y guardar",
        loading: applying,
        disabled: !canEnhance,
        onAction: () => applyWith({ ...options, engine }),
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

            {/* Print-readiness */}
            {hasSource && info?.printInches && (
              <Banner
                tone={dpi === null ? "info" : lowDpi ? "warning" : "success"}
              >
                {dpi !== null ? (
                  <>
                    Resolución actual ~<strong>{dpi} DPI</strong> para impresión
                    de {info.printInches.width}″ × {info.printInches.height}″
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
            )}

            {/* Engine selector */}
            <BlockStack gap="100">
              <Text as="span" variant="bodySm" tone="subdued">
                Motor de mejora
              </Text>
              <ButtonGroup variant="segmented">
                <Button
                  pressed={engine === "sharp"}
                  disabled={busy}
                  onClick={() => changeEngine("sharp")}
                >
                  Motor B · sharp + IA
                </Button>
                <Button
                  pressed={engine === "cloudinary"}
                  disabled={busy}
                  onClick={() => changeEngine("cloudinary")}
                >
                  Motor A · Cloudinary
                </Button>
              </ButtonGroup>
            </BlockStack>

            {/* Before / after */}
            <InlineStack gap="400" align="start" wrap>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">
                  Original
                </Text>
                <ImageBox src={info?.sourceUrl ?? null} alt="Original" />
              </BlockStack>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">
                  Vista previa
                </Text>
                <ImageBox
                  src={previewUrl ?? info?.sourceUrl ?? null}
                  alt="Vista previa"
                />
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
              onClick={() => applyWith(autoPreset(info, engine))}
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
                  label="Balance de color automático"
                  checked={options.autoColor ?? false}
                  onChange={(v) => updateOption("autoColor", v)}
                />
                <Checkbox
                  label="Mejora automática (improve)"
                  checked={options.improve ?? false}
                  onChange={(v) => updateOption("improve", v)}
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
  );
}
