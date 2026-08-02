"use client";

import { useRef, useState } from "react";
import {
  Card,
  Badge,
  Banner,
  Text,
  InlineStack,
  BlockStack,
  Divider,
} from "@shopify/polaris";
import { adminApi, AdminOrderItem } from "@/entities/admin/api";
import { VALID_TRANSITIONS } from "@/entities/admin/lib/order-transitions";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";
import PrintStudioModal from "./PrintStudioModal";
import ConvertToPbnModal from "./ConvertToPbnModal";
import { Modal } from "@shopify/polaris";
import { ItemActionsBar } from "./ItemActionsBar";
import { ItemFulfillmentControl } from "./ItemFulfillmentControl";
import { ItemMediaRow } from "./ItemMediaRow";
import { ItemProductPreview } from "./ItemProductPreview";
import { ItemProductSummaryRow } from "./ItemProductSummaryRow";
import { ItemStatusSelect } from "./ItemStatusSelect";
import { GenerationActionsBar } from "./GenerationActionsBar";
import { GenerationPickerModal } from "./GenerationPickerModal";

type OrderItemCardProps = {
  item: AdminOrderItem;
  orderId: string;
  userId: string | null;
  currency: string;
  shopifyImageUrl?: string | null;
  onUpdate: () => void;
  onRequestCancel: (itemIds: string[]) => void;
};

export function OrderItemCard({
  item,
  orderId,
  userId,
  currency,
  shopifyImageUrl,
  onUpdate,
  onRequestCancel,
}: OrderItemCardProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "in_house" | "pod"
  >(item.fulfillmentMethod as "in_house" | "pod");
  const [savingFulfillment, setSavingFulfillment] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showPBN, setShowPBN] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estado de la fila "Imagen generada".
  const [replacingGeneration, setReplacingGeneration] = useState(false);
  const [unlinkingGeneration, setUnlinkingGeneration] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pendingGenFile, setPendingGenFile] = useState<File | null>(null);
  const genFileInputRef = useRef<HTMLInputElement>(null);

  // Imagen del producto de Shopify relacionado: imagen de la variante comprada
  // (live desde Shopify) → preview del estilo. No cae al arte del cliente.
  const productImage =
    shopifyImageUrl ?? item.productRef?.style?.images?.[0]?.imageUrl ?? null;
  // Imagen generada por el usuario (IA): thumbnail para la card, full para la vista ampliada.
  const generatedThumb =
    item.generation?.thumbnailUrl ?? item.generation?.resultUrl ?? null;
  const generatedFull =
    item.generation?.resultUrl ?? item.generation?.thumbnailUrl ?? null;
  // Imagen final para impresión. El estudio arranca desde el diseño generado por
  // el cliente, así que mientras no exista la imagen procesada mostramos esa
  // generación como vista previa (marcada "Sin procesar"). Mismo orden de fallback
  // que PrintStudioModal.
  const printThumb =
    item.printImageUrl ?? generatedThumb ?? item.imageUrl ?? null;
  const printFull =
    item.printImageUrl ?? generatedFull ?? item.imageUrl ?? null;
  const printIsPreliminary =
    !item.printImageUrl && Boolean(generatedThumb ?? item.imageUrl);
  const allowed = VALID_TRANSITIONS[item.productionStatus] ?? [];

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      setErr("El archivo debe ser una imagen");
      return;
    }
    setUploadingImage(true);
    setErr(null);
    try {
      await adminApi.orders.uploadPrintImage(orderId, item.id, file);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploadingImage(false);
    }
  }

  // La subida sobrescribe la generación del cliente, así que pedimos confirmación
  // antes de hacerlo: guardamos el archivo elegido y mostramos el diálogo.
  function handleGenerationFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      setErr("El archivo debe ser una imagen");
      return;
    }
    setPendingGenFile(file);
  }

  async function handleConfirmReplaceGeneration() {
    if (!pendingGenFile) return;
    setReplacingGeneration(true);
    setErr(null);
    try {
      await adminApi.orders.uploadGenerationImage(
        orderId,
        item.id,
        pendingGenFile,
      );
      setPendingGenFile(null);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setReplacingGeneration(false);
    }
  }

  async function handleUnlinkGeneration() {
    setUnlinkingGeneration(true);
    setErr(null);
    try {
      await adminApi.orders.unlinkGeneration(orderId, item.id);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUnlinkingGeneration(false);
    }
  }

  async function handleFulfillmentChange(value: string) {
    const method = value as "in_house" | "pod";
    setFulfillmentMethod(method);
    setSavingFulfillment(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemFulfillment(orderId, item.id, method);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
      setFulfillmentMethod(item.fulfillmentMethod as "in_house" | "pod");
    } finally {
      setSavingFulfillment(false);
    }
  }

  async function handleStatusChange(toStatus: string) {
    setUpdatingStatus(true);
    setErr(null);
    try {
      await adminApi.orders.updateItemStatus(orderId, item.id, toStatus);
      onUpdate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleStatusSelect(value: string) {
    if (value === "cancelled") {
      onRequestCancel([item.id]);
    } else {
      handleStatusChange(value);
    }
  }

  return (
    <>
      {showStudio && (
        <PrintStudioModal
          orderId={orderId}
          item={item}
          onClose={() => setShowStudio(false)}
          onApplied={onUpdate}
        />
      )}
      {showPBN && (
        <ConvertToPbnModal
          item={item}
          orderId={orderId}
          onClose={() => setShowPBN(false)}
          onSaved={onUpdate}
        />
      )}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          title={item.title}
          onClose={() => setPreviewSrc(null)}
        />
      )}
      {showPicker && userId && (
        <GenerationPickerModal
          userId={userId}
          orderId={orderId}
          itemId={item.id}
          currentGenerationId={item.generation?.id ?? null}
          onClose={() => setShowPicker(false)}
          onLinked={onUpdate}
        />
      )}
      {pendingGenFile && (
        <Modal
          open
          onClose={() => setPendingGenFile(null)}
          title="Reemplazar imagen generada"
          primaryAction={{
            content: "Reemplazar",
            destructive: true,
            loading: replacingGeneration,
            onAction: handleConfirmReplaceGeneration,
          }}
          secondaryActions={[
            {
              content: "Cancelar",
              onAction: () => setPendingGenFile(null),
              disabled: replacingGeneration,
            },
          ]}
        >
          <Modal.Section>
            <Text as="p">
              Esto sobrescribe la imagen de la generación del cliente. La nueva
              imagen también aparecerá en su galería. ¿Continuar?
            </Text>
          </Modal.Section>
        </Modal>
      )}

      <ItemFulfillmentControl
        value={fulfillmentMethod}
        disabled={savingFulfillment}
        onChange={handleFulfillmentChange}
        productionStatus={item.productionStatus}
      />

      <Card>
        <BlockStack gap="300">
          <ItemProductSummaryRow
            item={item}
            image={productImage}
            currency={currency}
          />

          <Divider />

          <GenerationActionsBar
            hasGeneration={!!item.generation}
            canPickGeneration={!!userId}
            replacing={replacingGeneration}
            unlinking={unlinkingGeneration}
            fileInputRef={genFileInputRef}
            onReplaceClick={() => genFileInputRef.current?.click()}
            onReplaceChange={handleGenerationFileChange}
            onPickClick={() => setShowPicker(true)}
            onUnlinkClick={handleUnlinkGeneration}
          />

          <ItemMediaRow
            image={generatedThumb}
            alt={item.title}
            onZoom={
              generatedFull ? () => setPreviewSrc(generatedFull) : undefined
            }
          >
            <BlockStack gap="050">
              <Text variant="bodySm" tone="subdued" as="span">
                Imagen generada
              </Text>
              <Text variant="bodyMd" fontWeight="semibold" as="span">
                {item.title}
              </Text>
              {item.variantTitle && (
                <Text variant="bodySm" tone="subdued" as="span">
                  {item.variantTitle}
                </Text>
              )}
              <Text variant="bodySm" tone="subdued" as="span">
                {item.id}
              </Text>
            </BlockStack>
          </ItemMediaRow>

          {item.paintByNumbers && (
            <>
              <Divider />
              <ItemMediaRow
                image={item.paintByNumbers.previewUrl}
                alt="Paint by Numbers"
                onZoom={
                  item.paintByNumbers.previewUrl
                    ? () => setPreviewSrc(item.paintByNumbers!.previewUrl)
                    : undefined
                }
              >
                <BlockStack gap="050">
                  <InlineStack gap="150" blockAlign="center">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Paint by Numbers
                    </Text>
                    <Badge tone="success">Guardado</Badge>
                  </InlineStack>
                  {item.paintByNumbers.outlineSvgUrl && (
                    <a
                      href={item.paintByNumbers.outlineSvgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        Descargar SVG con números
                      </Text>
                    </a>
                  )}
                </BlockStack>
              </ItemMediaRow>
            </>
          )}

          <Divider />
          <ItemActionsBar
            hasPrintImage={!!item.printImageUrl}
            uploading={uploadingImage}
            fileInputRef={fileInputRef}
            onUploadClick={() => fileInputRef.current?.click()}
            onUploadChange={handleUploadImage}
            onOpenStudio={() => setShowStudio(true)}
            onOpenPBN={() => setShowPBN(true)}
          />

          <ItemProductPreview
            image={printThumb}
            alt={item.title}
            label="Imagen para impresión"
            size={item.size}
            preliminary={printIsPreliminary}
            onZoom={printFull ? () => setPreviewSrc(printFull) : undefined}
          />

          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}

          {allowed.length > 0 && (
            <>
              <Divider />
              <ItemStatusSelect
                allowed={allowed}
                disabled={updatingStatus}
                onSelect={handleStatusSelect}
              />
            </>
          )}
        </BlockStack>
      </Card>
    </>
  );
}
