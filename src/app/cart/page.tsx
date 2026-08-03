"use client";

import Link from "next/link";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { CartItemList, OrderSummary, PromoCodeBox } from "@/widgets/cart";
import { useShopifyCheckout } from "@/hooks/useShopifyCheckout";
import { useBundleDiscount } from "@/hooks/useBundleDiscount";
import { usePendingGenerationImages } from "@/hooks/usePendingGenerationImages";

export default function CartPage() {
  const { startCheckout, buildLines, isCheckingOut } = useShopifyCheckout();
  const discount = useBundleDiscount(buildLines);

  usePendingGenerationImages();

  const handleCheckout = async () => {
    const result = await startCheckout();
    if (result.status === "no-variants") {
      alert(
        "To test checkout, you need real Shopify Product Variant IDs. Please add products to your Shopify store and update the items with their Variant IDs.",
      );
    } else if (result.status === "error") {
      alert(
        result.message
          ? `Checkout error: ${result.message}`
          : "An error occurred during checkout. Please try again.",
      );
    }
  };

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-10 lg:px-40 py-10 font-body">
        <div className="max-w-300 mx-auto w-full">
          <div className="mb-8">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-dark/60 hover:text-primary transition-colors"
              href="/catalog"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Continue Shopping
            </Link>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-dark mb-10 tracking-tight">
            Your Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <CartItemList discount={discount} />
            </div>

            {/* El sticky va en el wrapper de la columna, no en la card: si lo
                lleva solo el resumen, al hacer scroll se desplaza sobre el
                promo box (sticky no reserva espacio en el flujo). */}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-6 lg:sticky lg:top-28">
                <OrderSummary
                  discount={discount}
                  isCheckingOut={isCheckingOut}
                  onCheckout={handleCheckout}
                />
                <PromoCodeBox />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
