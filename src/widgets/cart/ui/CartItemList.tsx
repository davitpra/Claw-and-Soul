"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { BundleDiscount } from "@/hooks/useBundleDiscount";
import CartItemRow from "./CartItemRow";

export default function CartItemList({
  discount,
}: {
  discount: BundleDiscount | null;
}) {
  const { items } = useCart();

  return (
    <div className="w-full p-6 rounded-4xl border border-slate-dark/5 bg-white">
      <div className="flex flex-col w-full">
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-dark/10 text-[11px] font-black text-slate-dark/40 uppercase tracking-widest">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-center">Quantity</div>
          <div className="col-span-3 text-right">Total</div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-dark/50 font-bold mb-4">
              Your cart is empty
            </p>
            <Link
              href="/catalog"
              className="text-primary font-black hover:underline"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              discount={discount?.byVariant[item.variantId] ?? 0}
              discountTitle={discount?.title ?? "Bundle discount"}
            />
          ))
        )}
      </div>
    </div>
  );
}
