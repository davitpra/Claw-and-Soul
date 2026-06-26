import { BlockStack, InlineStack, Text, Button, Badge } from "@shopify/polaris";
import type { EnhanceInfo } from "@/entities/admin/api";
import { dpiTone } from "./printStudio";

// Panel izquierdo del estudio de impresión: la previsualización ("stage") con
// las guías de corte/bleed/zona segura y la barra de info (px · DPI · pulgadas).
export function PrintStudioStage({
  currentImageUrl,
  onMeasure,
  displayUrl,
  stageAspect,
  bleedEnabled,
  bleedColor,
  cutInsetW,
  cutInsetH,
  safeInsetW,
  safeInsetH,
  showGuides,
  printInches,
  cssFilter,
  previewUrl,
  measuredPx,
  currentDpi,
  info,
  onZoom,
}: {
  currentImageUrl: string | null;
  onMeasure: (px: { w: number; h: number }) => void;
  displayUrl: string | null;
  stageAspect: string;
  bleedEnabled: boolean;
  bleedColor: string;
  cutInsetW: number;
  cutInsetH: number;
  safeInsetW: number;
  safeInsetH: number;
  showGuides: boolean;
  printInches: { width: number; height: number } | null;
  cssFilter: string | undefined;
  previewUrl: string | null;
  measuredPx: { w: number; h: number } | null;
  currentDpi: number | null;
  info: EnhanceInfo | null;
  onZoom: (zoom: { src: string; title: string }) => void;
}) {
  return (
    <>
      {/* Hidden image to measure the real delivered dimensions of the current master */}
      {currentImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentImageUrl}
          alt=""
          aria-hidden
          style={{ display: "none" }}
          onLoad={(e) =>
            onMeasure({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
        />
      )}

      {/* ── LEFT: image stage ───────────────────────────────────── */}
      <div style={{ flexShrink: 0, width: 500 }}>
        <BlockStack gap="200" inlineAlign="center">
          <div
            style={{
              position: "relative",
              width: "100%",
              // El contenedor de formato (caja con fondo, borde y recorte por
              // bleed) solo se muestra cuando las guías están activas. Sin
              // guías, la imagen se ve sola en su proporción natural.
              ...(showGuides && printInches
                ? {
                    aspectRatio: stageAspect,
                    background: bleedEnabled ? bleedColor : "#ebebeb",
                    borderRadius: 6,
                    border: "1px solid #c9cccf",
                    overflow: "hidden",
                  }
                : {}),
            }}
          >
            {/* Con guías la imagen llena el área de formato (inset por el % de
                corte); sin guías se muestra completa en su proporción natural. */}
            {displayUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Vista de impresión"
                style={
                  showGuides && printInches
                    ? {
                        position: "absolute",
                        top: `${cutInsetH}%`,
                        left: `${cutInsetW}%`,
                        width: `${100 - 2 * cutInsetW}%`,
                        height: `${100 - 2 * cutInsetH}%`,
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                        filter: cssFilter,
                      }
                    : {
                        display: "block",
                        width: "100%",
                        height: "auto",
                        borderRadius: 6,
                        filter: cssFilter,
                      }
                }
              />
            )}
            {!displayUrl && (
              <div
                style={{
                  width: "100%",
                  aspectRatio: stageAspect,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ebebeb",
                  borderRadius: 6,
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
              Vista previa (aprox.) — el archivo guardado no cambia hasta pulsar
              Guardar.
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
                  <Badge
                    tone={dpiTone(currentDpi)}
                  >{`${currentDpi} DPI`}</Badge>
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
          {measuredPx &&
            info?.sourcePx &&
            (measuredPx.w !== info.sourcePx.width ||
              measuredPx.h !== info.sourcePx.height) && (
              <Text as="span" variant="bodySm" tone="subdued">
                Origen: {info.sourcePx.width} × {info.sourcePx.height} px
              </Text>
            )}

          {info?.printImageUrl && (
            <Button
              variant="plain"
              onClick={() =>
                onZoom({
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
    </>
  );
}
