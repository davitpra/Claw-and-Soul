"use client";

import { Card } from "@shopify/polaris";
import {
  CashDollarIcon,
  MagicIcon,
  OrderIcon,
  TeamIcon,
} from "@shopify/polaris-icons";
import {
  OverviewGrowth,
  OverviewMoney,
  OverviewPipeline,
} from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";
import { SectionKey } from "./sections";
import { Stat, StatRow } from "./StatRow";
import { deltaTone, fmtCount, fmtDelta, fmtPct } from "./format";

interface KpiRowProps {
  money: OverviewMoney;
  pipeline: OverviewPipeline;
  growth: OverviewGrowth;
  currency: string;
  periodLabel: string;
  /** Sección abierta debajo; su celda queda resaltada. */
  section: SectionKey;
}

/**
 * Cabecera del dashboard: una cifra por dominio, cada una contra el periodo
 * anterior. Es el índice fijo de la página — se ve entera aunque abajo solo se
 * muestre una sección, y la celda de la sección abierta va resaltada con el
 * mismo icono que su cabecera.
 *
 * El margen y el ticket medio viven en `MoneyCard`: aquí competían con las otras
 * tres familias de datos, y dos KPIs de dinero sobre cuatro desbalanceaban la
 * fila frente a pedidos, generaciones y usuarios.
 *
 * Los importes llevan "≈" porque el backend convierte a moneda base con tipos
 * de referencia del BCE, no con el cambio exacto que aplicó cada pasarela.
 */
export function KpiRow({
  money,
  pipeline,
  growth,
  currency,
  periodLabel,
  section,
}: KpiRowProps) {
  const stats: Stat[] = [
    {
      label: "Ingresos",
      icon: CashDollarIcon,
      selected: section === "money",
      value: `≈ ${fmtCurrency(money.revenue, currency)}`,
      detail: `${periodLabel} anterior: ${fmtCurrency(money.revenuePrev, currency)}`,
      delta: fmtDelta(money.revenueDeltaPct),
      deltaTone: deltaTone(money.revenueDeltaPct),
    },
    {
      label: "Pedidos pagados",
      icon: OrderIcon,
      selected: section === "orders",
      value: fmtCount(money.orders),
      detail: `${periodLabel} anterior: ${fmtCount(money.ordersPrev)}`,
      delta: fmtDelta(money.ordersDeltaPct),
      deltaTone: deltaTone(money.ordersDeltaPct),
    },
    {
      label: "Generaciones",
      icon: MagicIcon,
      selected: section === "generations",
      value: fmtCount(pipeline.total),
      detail: `${fmtPct(pipeline.failureRate)} de fallo`,
      delta: fmtDelta(pipeline.totalDeltaPct),
      deltaTone: deltaTone(pipeline.totalDeltaPct),
    },
    {
      label: "Usuarios nuevos",
      icon: TeamIcon,
      selected: section === "users",
      value: fmtCount(growth.newUsers),
      detail: `${fmtCount(growth.totalUsers)} registrados en total`,
      delta: fmtDelta(growth.newUsersDeltaPct),
      deltaTone: deltaTone(growth.newUsersDeltaPct),
    },
  ];

  return (
    // Sin padding para que los divisores de las celdas lleguen de borde a borde.
    <Card padding="0">
      <StatRow stats={stats} />
    </Card>
  );
}
