"use client";

import { BlockStack, Banner } from "@shopify/polaris";
import { OverviewPipeline, OverviewProduction, OverviewStats } from "@/entities/admin/api";

interface AlertsBannerProps {
  production: OverviewProduction;
  pipeline: OverviewPipeline;
  syncHealth: OverviewStats["syncHealth"];
}

/**
 * Lo que hay que atender ahora mismo. Si no hay nada, no se renderiza nada: un
 * banner permanente de "todo bien" deja de leerse a la semana.
 *
 * Cada aviso enlaza a la vista que lo resuelve. La lista de pedidos lee
 * `?status=` al montar, así que el filtro llega aplicado.
 */
export function AlertsBanner({
  production,
  pipeline,
  syncHealth,
}: AlertsBannerProps) {
  const { artFailed, onHold, pendingPaid } = production.blocked;

  const alerts: {
    key: string;
    tone: "critical" | "warning";
    title: string;
    action?: { content: string; url: string };
  }[] = [];

  if (artFailed > 0) {
    alerts.push({
      key: "art_failed",
      tone: "critical",
      title: `${artFailed} artículo(s) con el arte fallido`,
      action: { content: "Ver pedidos", url: "/admin/orders?status=art_failed" },
    });
  }

  if (pendingPaid > 0) {
    alerts.push({
      key: "pending_paid",
      tone: "critical",
      title: `${pendingPaid} artículo(s) pagados siguen en «Pago pendiente»`,
      action: { content: "Ver pedidos", url: "/admin/orders?status=pending" },
    });
  }

  if (onHold > 0) {
    alerts.push({
      key: "on_hold",
      tone: "warning",
      title: `${onHold} artículo(s) en espera`,
      action: { content: "Ver pedidos", url: "/admin/orders?status=on_hold" },
    });
  }

  if (pipeline.stuck > 0) {
    alerts.push({
      key: "stuck",
      tone: "warning",
      title: `${pipeline.stuck} generación(es) sin terminar tras ${pipeline.stuckAfterMinutes} min`,
    });
  }

  if (syncHealth.lastStatus === "failed" || syncHealth.failedLast24h > 0) {
    alerts.push({
      key: "sync",
      tone: "warning",
      title:
        syncHealth.failedLast24h > 0
          ? `${syncHealth.failedLast24h} sincronización(es) fallida(s) en 24 h`
          : "La última sincronización con Shopify falló",
      action: { content: "Ver productos", url: "/admin/products" },
    });
  }

  if (alerts.length === 0) return null;

  return (
    <BlockStack gap="200">
      {alerts.map((alert) => (
        <Banner key={alert.key} tone={alert.tone} title={alert.title} action={alert.action} />
      ))}
    </BlockStack>
  );
}
