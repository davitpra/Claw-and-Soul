import type { Dispatch, SetStateAction } from "react";
import {
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Button,
  Select,
  RangeSlider,
  Checkbox,
  Box,
  Divider,
  Badge,
  ColorPicker,
} from "@shopify/polaris";
import type { EnhanceInfo } from "@/entities/admin/api";
import type { HsbColor } from "@/lib/colorUtils";
import { GOOD_DPI, dpiTone } from "./printStudio";

// Panel derecho del estudio de impresión: upscale IA, ajustes de imagen, bleed
// y opciones de salida.
export function PrintStudioControls({
  err,
  setErr,
  savedOk,
  setSavedOk,
  hasSource,
  currentDpi,
  printInches,
  info,
  upscaleFactor,
  setUpscaleFactor,
  targetPx,
  theoreticalDpi,
  canAct,
  upscaling,
  onUpscale,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  sharpen,
  setSharpen,
  improve,
  setImprove,
  fitToFormat,
  setFitToFormat,
  previewing,
  onPreview,
  bleedEnabled,
  setBleedEnabled,
  bleedHsb,
  bleedColor,
  onBleedColorChange,
  showGuides,
  setShowGuides,
  format,
  setFormat,
  reverting,
  busy,
  onRevert,
  invalidatePreview,
}: {
  err: string | null;
  setErr: Dispatch<SetStateAction<string | null>>;
  savedOk: boolean;
  setSavedOk: Dispatch<SetStateAction<boolean>>;
  hasSource: boolean;
  currentDpi: number | null;
  printInches: { width: number; height: number } | null;
  info: EnhanceInfo | null;
  upscaleFactor: number;
  setUpscaleFactor: Dispatch<SetStateAction<number>>;
  targetPx: { w: number; h: number } | null;
  theoreticalDpi: number | null;
  canAct: boolean;
  upscaling: boolean;
  onUpscale: () => void;
  brightness: number;
  setBrightness: Dispatch<SetStateAction<number>>;
  contrast: number;
  setContrast: Dispatch<SetStateAction<number>>;
  saturation: number;
  setSaturation: Dispatch<SetStateAction<number>>;
  sharpen: number;
  setSharpen: Dispatch<SetStateAction<number>>;
  improve: boolean;
  setImprove: Dispatch<SetStateAction<boolean>>;
  fitToFormat: boolean;
  setFitToFormat: Dispatch<SetStateAction<boolean>>;
  previewing: boolean;
  onPreview: () => void;
  bleedEnabled: boolean;
  setBleedEnabled: Dispatch<SetStateAction<boolean>>;
  bleedHsb: HsbColor;
  bleedColor: string;
  onBleedColorChange: (hsb: HsbColor) => void;
  showGuides: boolean;
  setShowGuides: Dispatch<SetStateAction<boolean>>;
  format: "jpeg" | "png";
  setFormat: Dispatch<SetStateAction<"jpeg" | "png">>;
  reverting: boolean;
  busy: boolean;
  onRevert: () => void;
  invalidatePreview: () => void;
}) {
  return (
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
                Resolución actual: <strong>{currentDpi} DPI</strong> para{" "}
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
            <Banner tone={info.sourceDpi < GOOD_DPI ? "warning" : "success"}>
              Resolución origen: <strong>{info.sourceDpi} DPI</strong> para{" "}
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
          {info?.hasUpscaledBase && (
            <Banner tone="info">
              Imagen ya agrandada con IA. Usa el botón para volver a ejecutar el
              motor desde la imagen original con un factor diferente.
            </Banner>
          )}
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
            Solo este botón ejecuta el motor de IA. Los ajustes de abajo se
            guardan sin volver a agrandar.
          </Text>
          <Box>
            <Button
              loading={upscaling}
              disabled={!canAct || upscaleFactor <= 1}
              onClick={onUpscale}
            >
              {info?.hasUpscaledBase
                ? "Volver a agrandar con IA"
                : "Agrandar con IA"}
            </Button>
          </Box>
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
            <Button loading={previewing} disabled={!canAct} onClick={onPreview}>
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
                onChange={onBleedColorChange}
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
              onClick={onRevert}
            >
              Revertir al original
            </Button>
          </>
        )}
      </BlockStack>
    </div>
  );
}
