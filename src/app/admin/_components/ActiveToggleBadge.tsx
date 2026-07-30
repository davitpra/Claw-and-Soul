"use client";

import { Badge, InlineStack, Spinner } from "@shopify/polaris";

interface ActiveToggleBadgeProps {
  isActive: boolean;
  /** El toggle de esta fila está en vuelo. */
  loading: boolean;
  onToggle: () => void;
  /** Nombre singular del recurso para el aria-label ("estilo", "producto"). */
  resourceLabel: string;
}

/**
 * Badge Activo/Inactivo que además actúa como interruptor. Lo comparten las
 * tablas de estilos, configs y productos.
 *
 * El botón va desnudo (sin `Button` de Polaris) a propósito: lo que se ve y se
 * clica es el `Badge`; el `button` solo aporta la semántica y el foco.
 */
export function ActiveToggleBadge({
  isActive,
  loading,
  onToggle,
  resourceLabel,
}: ActiveToggleBadgeProps) {
  return (
    <InlineStack gap="200" blockAlign="center">
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        aria-label={`${isActive ? "Desactivar" : "Activar"} ${resourceLabel}`}
        title={isActive ? "Click para desactivar" : "Click para activar"}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Badge tone={isActive ? "success" : "enabled"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      </button>
      {loading && <Spinner size="small" />}
    </InlineStack>
  );
}
