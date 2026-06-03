"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Button,
  ButtonGroup,
  Badge,
  Spinner,
} from "@shopify/polaris";
import { adminApi, AdminOrderItem, EnhanceInfo } from "@/entities/admin/api";

const GOOD_DPI = 150;
const LOW_DPI = 100;
/** Aspect-ratio tolerance below which we treat the image as "fitting" the format. */
const FIT_TOLERANCE = 0.02;

type FitMode = "cover" | "contain";

function dpiTone(dpi: number | null): "success" | "warning" | "critical" {
  if (dpi === null || dpi < LOW_DPI) return "critical";
  if (dpi < GOOD_DPI) return "warning";
  return "success";
}

export default function PrintProofModal({
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
  const [mode, setMode] = useState<FitMode>("cover");
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [applying, setApplying] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const proofUrl =
    item.printImageUrl ?? item.generation?.resultUrl ?? item.imageUrl ?? null;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await adminApi.orders.enhanceInfo(orderId, item.id);
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
  }, [orderId, item.id]);

  const printInches = info?.printInches ?? null;
  const printAspect = printInches ? printInches.width / printInches.height : null;
  const imageAspect = imgDims ? imgDims.w / imgDims.h : null;

  const dpi =
    imgDims && printInches
      ? Math.floor(
          Math.min(
            imgDims.w / printInches.width,
            imgDims.h / printInches.height,
          ),
        )
      : null;

  const fits =
    printAspect !== null &&
    imageAspect !== null &&
    Math.abs(imageAspect - printAspect) / printAspect < FIT_TOLERANCE;

  const cropPct =
    printAspect !== null && imageAspect !== null
      ? Math.round(
          (1 -
            Math.min(imageAspect, printAspect) /
              Math.max(imageAspect, printAspect)) *
            100,
        )
      : null;

  const orientation =
    printInches === null
      ? ""
      : printInches.width === printInches.height
        ? "cuadrado"
        : printInches.width > printInches.height
          ? "horizontal"
          : "vertical";

  async function handleFit() {
    setApplying(true);
    setErr(null);
    try {
      await adminApi.orders.enhance(orderId, item.id, { fitToFormat: true });
      onApplied();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
      setApplying(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Vista de prueba de impresión"
      primaryAction={{ content: "Cerrar", onAction: onClose }}
    >
      <Modal.Section>
        {loadingInfo ? (
          <InlineStack align="center" gap="200">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando formato…
            </Text>
          </InlineStack>
        ) : (
          <BlockStack gap="400">
            {err && (
              <Banner tone="critical" onDismiss={() => setErr(null)}>
                {err}
              </Banner>
            )}

            {!proofUrl ? (
              <Banner tone="warning">
                Este item no tiene imagen. Sube una con “Subir imagen” o mejora
                una generación primero.
              </Banner>
            ) : !printInches ? (
              <Banner tone="info">
                Este item no tiene un formato de impresión POD configurado, así
                que no se puede simular el encuadre.
              </Banner>
            ) : (
              <>
                <Text as="span" variant="bodySm" tone="subdued">
                  Así se encuadrará en el formato del producto (
                  {printInches.width}″ × {printInches.height}″ · {orientation}).
                </Text>

                <InlineStack align="center">
                  <div
                    style={{
                      width: 280,
                      aspectRatio: `${printInches.width} / ${printInches.height}`,
                      border: "1px solid #c9cccf",
                      borderRadius: 8,
                      background:
                        "repeating-conic-gradient(#eee 0% 25%, #fafafa 0% 50%) 50% / 16px 16px",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofUrl}
                      alt="Vista de prueba"
                      onLoad={(e) =>
                        setImgDims({
                          w: e.currentTarget.naturalWidth,
                          h: e.currentTarget.naturalHeight,
                        })
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: mode,
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  </div>
                </InlineStack>

                <InlineStack align="center">
                  <ButtonGroup variant="segmented">
                    <Button
                      pressed={mode === "cover"}
                      onClick={() => setMode("cover")}
                    >
                      Cómo saldrá (recorte)
                    </Button>
                    <Button
                      pressed={mode === "contain"}
                      onClick={() => setMode("contain")}
                    >
                      Imagen completa
                    </Button>
                  </ButtonGroup>
                </InlineStack>

                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                  alignment="center"
                >
                  {mode === "cover"
                    ? "Vista al tamaño de impresión: la imagen se amplía al recorte, por eso se ve más grande/suave. No es pérdida de calidad del archivo — la nitidez real la indica el DPI."
                    : "Imagen completa reducida para ver todo el encuadre (las barras son la zona que se recorta)."}
                </Text>

                <InlineStack gap="200" align="center" blockAlign="center">
                  <Badge tone={dpiTone(dpi)}>
                    {dpi !== null ? `${dpi} DPI` : "DPI desconocido"}
                  </Badge>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {dpi === null
                      ? "Resolución no disponible"
                      : dpi >= GOOD_DPI
                        ? "Claridad suficiente para imprimir"
                        : "Resolución baja — considera mejorar/upscale"}
                  </Text>
                </InlineStack>

                {fits ? (
                  <Banner tone="success">
                    La imagen <strong>encaja perfecto</strong> en el formato; no
                    se recortará nada.
                  </Banner>
                ) : (
                  cropPct !== null && (
                    <Banner tone="warning">
                      La imagen no coincide con el formato: se recortará{" "}
                      <strong>~{cropPct}%</strong> de un lado (recorte centrado).
                      Usa “Ajustar al formato” para controlarlo.
                    </Banner>
                  )
                )}

                <Button
                  variant="primary"
                  fullWidth
                  loading={applying}
                  disabled={fits}
                  onClick={handleFit}
                >
                  Ajustar al formato (recorte centrado)
                </Button>
                <Text as="span" variant="bodySm" tone="subdued">
                  La simulación asume recorte centrado. “Ajustar al formato”
                  envía la imagen ya recortada al ratio exacto para garantizar el
                  encuadre.
                </Text>
              </>
            )}
          </BlockStack>
        )}
      </Modal.Section>
    </Modal>
  );
}
