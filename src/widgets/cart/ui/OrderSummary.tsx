"use client";

import { useCart } from "@/context/CartContext";
import type { BundleDiscount } from "@/hooks/useBundleDiscount";

// Estimado que se muestra antes del checkout; Shopify calcula el impuesto real.
const TAX_RATE = 0.08;

interface OrderSummaryProps {
  discount: BundleDiscount | null;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

export default function OrderSummary({
  discount,
  isCheckingOut,
  onCheckout,
}: OrderSummaryProps) {
  const { items, subtotal } = useCart();

  const discountAmount = discount?.amount ?? 0;
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal - discountAmount) + tax;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-dark/5 border border-slate-dark/5">
      <h3 className="font-display text-xl font-black text-slate-dark mb-8 uppercase tracking-tight">
        Order Summary
      </h3>

      <div className="flex flex-col gap-5 mb-8">
        <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        {discountAmount > 0 && (
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">
                sell
              </span>
              {discount?.title ?? "Bundle discount"}
            </span>
            <span className="font-black text-primary">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-slate-dark/70 font-medium">
          <span>Shipping estimate</span>
          <span className="text-primary font-black uppercase tracking-wider text-sm">
            Free
          </span>
        </div>
        <SummaryRow label="Tax estimate" value={`$${tax.toFixed(2)}`} />
      </div>

      <div className="h-px w-full bg-slate-dark/10 mb-8" />

      <div className="flex items-center justify-between mb-10">
        <span className="text-lg font-black text-slate-dark uppercase tracking-tight">
          Order Total
        </span>
        <span className="text-3xl font-black text-slate-dark tracking-tighter">
          ${total.toFixed(2)}
        </span>
      </div>

      <button
        onClick={onCheckout}
        disabled={items.length === 0 || isCheckingOut}
        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isCheckingOut ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        ) : (
          <>
            Proceed to Checkout
            <span className="material-symbols-outlined font-bold">
              arrow_forward
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-dark/30 uppercase tracking-widest text-center">
        <span className="material-symbols-outlined text-[14px]">lock</span>
        Secure 256-bit SSL Checkout
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-dark/70 font-medium">
      <span>{label}</span>
      <span className="font-black text-slate-dark">{value}</span>
    </div>
  );
}
