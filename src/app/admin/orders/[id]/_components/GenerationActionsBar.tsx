"use client";

import { RefObject } from "react";
import { Button, InlineStack } from "@shopify/polaris";
import { ImageIcon, ReplaceIcon, DeleteIcon } from "@shopify/polaris-icons";

type GenerationActionsBarProps = {
  hasGeneration: boolean;
  canPickGeneration: boolean;
  replacing: boolean;
  unlinking: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onReplaceClick: () => void;
  onReplaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickClick: () => void;
  onUnlinkClick: () => void;
};

// Barra de acciones de la fila "Imagen generada": reemplazar el archivo de la
// generación del cliente, re-vincular a otra generación o desvincular del item.
export function GenerationActionsBar({
  hasGeneration,
  canPickGeneration,
  replacing,
  unlinking,
  fileInputRef,
  onReplaceClick,
  onReplaceChange,
  onPickClick,
  onUnlinkClick,
}: GenerationActionsBarProps) {
  return (
    <InlineStack gap="200" blockAlign="center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onReplaceChange}
      />
      <Button
        size="micro"
        icon={ImageIcon}
        loading={replacing}
        disabled={!hasGeneration}
        onClick={onReplaceClick}
      >
        Reemplazar
      </Button>
      <Button
        size="micro"
        icon={ReplaceIcon}
        disabled={!canPickGeneration}
        onClick={onPickClick}
      >
        Cambiar generación
      </Button>
      <Button
        size="micro"
        tone="critical"
        icon={DeleteIcon}
        loading={unlinking}
        disabled={!hasGeneration}
        onClick={onUnlinkClick}
      >
        Quitar
      </Button>
    </InlineStack>
  );
}
