import { formatFinancialStatus, formatPrice } from "../lib/presentation";
import type { UserOrderDetail } from "../types";

interface OrderSummaryProps {
  order: UserOrderDetail;
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-text-main" : "text-text-muted"}>
        {label}
      </span>
      <span className={bold ? "font-bold text-text-main" : "text-text-main"}>
        {value}
      </span>
    </div>
  );
}

/**
 * Desglose de totales de una orden: pago, subtotal, envío, impuestos y total.
 * Las filas opcionales se omiten cuando el backend no envía el importe.
 */
export function OrderSummary({ order }: OrderSummaryProps) {
  const paymentStatus = formatFinancialStatus(order.financialStatus);

  return (
    <div className="mt-4 space-y-2 text-sm">
      {paymentStatus && <SummaryRow label="Payment" value={paymentStatus} />}
      {order.subtotalAmount != null && (
        <SummaryRow
          label="Subtotal"
          value={formatPrice(order.subtotalAmount, order.currency)}
        />
      )}
      {order.shippingAmount != null && (
        <SummaryRow
          label="Shipping"
          value={formatPrice(order.shippingAmount, order.currency)}
        />
      )}
      {order.taxAmount != null && (
        <SummaryRow
          label="Tax"
          value={formatPrice(order.taxAmount, order.currency)}
        />
      )}
      <div className="mt-1 flex items-center justify-between border-t border-cream pt-3">
        <span className="font-bold text-text-main">Total</span>
        <span className="text-base font-bold text-text-main">
          {formatPrice(order.totalAmount, order.currency)}
        </span>
      </div>
    </div>
  );
}
