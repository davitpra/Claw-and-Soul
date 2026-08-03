import type { IconSource } from "@shopify/polaris";
import {
  CashDollarIcon,
  MagicIcon,
  OrderIcon,
  TeamIcon,
} from "@shopify/polaris-icons";
import type { TimelineMetric } from "./TimelineCard";

export type SectionKey = "money" | "orders" | "generations" | "users";

export interface DashboardSectionDef {
  key: SectionKey;
  label: string;
  icon: IconSource;
  /** Alcance temporal de las cifras: es la ambigüedad recurrente del dashboard. */
  description: string;
  action: { label: string; url: string };
  /** Serie que pinta `TimelineCard` mientras la sección está activa. */
  metric: TimelineMetric;
}

/**
 * Los cuatro dominios del dashboard. El orden es el del selector, el de la fila
 * de KPIs y el de los iconos del sidebar: una sola lista manda sobre las tres
 * cosas, así que no pueden desincronizarse.
 */
export const DASHBOARD_SECTIONS: DashboardSectionDef[] = [
  {
    key: "money",
    label: "Ingresos",
    icon: CashDollarIcon,
    description: "Dinero movido dentro del periodo",
    action: { label: "Ver gastos", url: "/admin/expenses" },
    metric: "revenue",
  },
  {
    key: "orders",
    label: "Pedidos y producción",
    icon: OrderIcon,
    description: "Cola en tiempo real; envíos y entregas del periodo",
    action: { label: "Ver pedidos", url: "/admin/orders" },
    metric: "orders",
  },
  {
    key: "generations",
    label: "Generaciones",
    icon: MagicIcon,
    description: "Pipeline de IA, sin las pruebas del admin",
    action: { label: "Ver estilos", url: "/admin/styles" },
    metric: "generations",
  },
  {
    key: "users",
    label: "Usuarios y créditos",
    icon: TeamIcon,
    description: "Altas del periodo; saldos y registrados acumulados",
    action: { label: "Ver usuarios", url: "/admin/users" },
    metric: "newUsers",
  },
];
