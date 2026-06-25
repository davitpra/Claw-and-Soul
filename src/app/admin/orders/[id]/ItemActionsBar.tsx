"use client";

import { RefObject } from "react";
import { Badge, Button, InlineStack } from "@shopify/polaris";
import { ImageIcon, MagicIcon } from "@shopify/polaris-icons";

type ItemActionsBarProps = {
  hasPrintImage: boolean;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUploadClick: () => void;
  onUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenStudio: () => void;
};

// Barra de acciones del item: subir/reemplazar la imagen de impresión y abrir
// el editor para impresión.
export function ItemActionsBar({
  hasPrintImage,
  uploading,
  fileInputRef,
  onUploadClick,
  onUploadChange,
  onOpenStudio,
}: ItemActionsBarProps) {
  return (
    <InlineStack gap="200" blockAlign="center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onUploadChange}
      />
      <Button
        size="micro"
        icon={ImageIcon}
        loading={uploading}
        onClick={onUploadClick}
      >
        {hasPrintImage ? "Reemplazar" : "Subir imagen"}
      </Button>
      <Button size="micro" icon={MagicIcon} onClick={onOpenStudio}>
        Editar para impresión
      </Button>
      {hasPrintImage && <Badge tone="info">Imagen personalizada</Badge>}
    </InlineStack>
  );
}
