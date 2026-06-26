"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  InlineStack,
  Text,
  Spinner,
  Button,
  Popover,
  ActionList,
} from "@shopify/polaris";
import {
  adminApi,
  AdminOrderItem,
  EnhanceInfo,
  EnhanceOptions,
} from "@/entities/admin/api";
import {
  cloudinaryDownloadUrl,
  type DownloadFormat,
} from "@/shared/lib/cloudinary";
import { hexToHsb, hsbToHex, HsbColor } from "@/lib/colorUtils";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import {
  GOOD_DPI,
  DEFAULT_UPSCALE_FACTOR,
  computePrintGeometry,
} from "./printStudio";
import { PrintStudioStage } from "./PrintStudioStage";
import { PrintStudioControls } from "./PrintStudioControls";

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
  const [measuredPx, setMeasuredPx] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [dlOpen, setDlOpen] = useState(false);

  // Controls
  const [upscaleFactor, setUpscaleFactor] = useState(DEFAULT_UPSCALE_FACTOR);
  const [upscaling, setUpscaling] = useState(false);
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
          } else {
            // Already enhanced — reset slider to 1 so the user must explicitly
            // choose a factor before re-running the AI upscale.
            setUpscaleFactor(1);
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

  const busy = applying || reverting || upscaling;
  const hasSource = Boolean(info?.sourceUrl);
  const canAct = hasSource && !busy && !loadingInfo;

  // CSS filter for live brightness/contrast/saturation preview
  const cssFilter =
    [
      brightness !== 0 ? `brightness(${1 + brightness / 100})` : "",
      contrast !== 0 ? `contrast(${1 + contrast / 100})` : "",
      saturation !== 0 ? `saturate(${1 + saturation / 100})` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  // Derived print geometry (guides, target px/DPI) — pure, no backend call.
  const {
    printInches,
    cutInsetW,
    cutInsetH,
    safeInsetW,
    safeInsetH,
    stageAspect,
    targetPx,
    theoreticalDpi,
  } = computePrintGeometry(info, upscaleFactor);

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

  async function handleUpscale() {
    setUpscaling(true);
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
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              printImageUrl,
              alreadyEnhanced: true,
              hasUpscaledBase: true,
            }
          : prev,
      );
      setPreviewUrl(null);
      setSavedUrl(printImageUrl);
      setSavedOk(true);
      onApplied();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUpscaling(false);
    }
  }

  async function handleSave() {
    setApplying(true);
    setErr(null);
    try {
      // Never pass upscaleFactor here — "Guardar" only re-applies colour/bleed
      // adjustments on the existing high-res base (or original if not upscaled yet).
      const opts: EnhanceOptions = {
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

  function handleDownload(fmt: DownloadFormat) {
    if (!currentImageUrl) return;
    const href = cloudinaryDownloadUrl(
      currentImageUrl,
      fmt,
      `impresion-${item.id}`,
    );
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDlOpen(false);
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
        footer={
          <Popover
            active={dlOpen}
            onClose={() => setDlOpen(false)}
            activator={
              <Button
                disclosure
                disabled={!currentImageUrl || loadingInfo}
                onClick={() => setDlOpen((v) => !v)}
              >
                Descargar
              </Button>
            }
          >
            <ActionList
              items={[
                {
                  content: "PNG (alta calidad)",
                  onAction: () => handleDownload("png"),
                },
                {
                  content: "JPG (alta calidad)",
                  onAction: () => handleDownload("jpg"),
                },
                { content: "WEBP", onAction: () => handleDownload("webp") },
                { content: "PDF", onAction: () => handleDownload("pdf") },
              ]}
            />
          </Popover>
        }
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
                alignItems: "flex-center",
              }}
            >
              <PrintStudioStage
                currentImageUrl={currentImageUrl}
                onMeasure={setMeasuredPx}
                displayUrl={displayUrl}
                stageAspect={stageAspect}
                bleedEnabled={bleedEnabled}
                bleedColor={bleedColor}
                cutInsetW={cutInsetW}
                cutInsetH={cutInsetH}
                safeInsetW={safeInsetW}
                safeInsetH={safeInsetH}
                showGuides={showGuides}
                printInches={printInches}
                cssFilter={cssFilter}
                previewUrl={previewUrl}
                measuredPx={measuredPx}
                currentDpi={currentDpi}
                info={info}
                onZoom={setZoom}
              />

              {/* Vertical divider */}
              <div
                style={{
                  alignSelf: "stretch",
                  width: 1,
                  background: "#e3e3e3",
                  flexShrink: 0,
                }}
              />

              <PrintStudioControls
                err={err}
                setErr={setErr}
                savedOk={savedOk}
                setSavedOk={setSavedOk}
                hasSource={hasSource}
                currentDpi={currentDpi}
                printInches={printInches}
                info={info}
                upscaleFactor={upscaleFactor}
                setUpscaleFactor={setUpscaleFactor}
                targetPx={targetPx}
                theoreticalDpi={theoreticalDpi}
                canAct={canAct}
                upscaling={upscaling}
                onUpscale={handleUpscale}
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                saturation={saturation}
                setSaturation={setSaturation}
                sharpen={sharpen}
                setSharpen={setSharpen}
                improve={improve}
                setImprove={setImprove}
                fitToFormat={fitToFormat}
                setFitToFormat={setFitToFormat}
                previewing={previewing}
                onPreview={handlePreviewExact}
                bleedEnabled={bleedEnabled}
                setBleedEnabled={setBleedEnabled}
                bleedHsb={bleedHsb}
                bleedColor={bleedColor}
                onBleedColorChange={updateBleedColor}
                showGuides={showGuides}
                setShowGuides={setShowGuides}
                format={format}
                setFormat={setFormat}
                reverting={reverting}
                busy={busy}
                onRevert={handleRevert}
                invalidatePreview={invalidatePreview}
              />
            </div>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
}
