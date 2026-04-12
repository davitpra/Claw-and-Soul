"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormatOptions, FormatOption } from "@/hooks/useFormatOptions";
import { Product } from "@/entities/pet-product/model/types";
import { FormatSelector } from "./FormatSelector";
import { useCart } from "@/context/CartContext";

interface IAPreviewStepProps {
  products: Product[];
  selectedProduct: string;
  onProductSelect: (name: string) => void;
  selectedFormat: FormatOption | null;
  onFormatSelect: (format: FormatOption) => void;
  preSelectedFormatId?: string | null;
  isLoadingProducts?: boolean;
  productsError?: string | null;
}

export function IAPreviewStep({
  products,
  selectedProduct,
  onProductSelect,
  selectedFormat,
  onFormatSelect,
  preSelectedFormatId,
  isLoadingProducts = false,
  productsError = null,
}: IAPreviewStepProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const activeProduct = products.find((p) => p.name === selectedProduct);
  const { formats, isLoading, error } = useFormatOptions(
    activeProduct?.shopifyHandle ?? null,
  );

  // Auto-select format from URL param once formats are loaded
  useEffect(() => {
    if (!preSelectedFormatId || selectedFormat || formats.length === 0) return;
    const match = formats.find((f) => f.formatId === preSelectedFormatId);
    if (match) onFormatSelect(match);
  }, [formats, preSelectedFormatId, selectedFormat, onFormatSelect]);

  const hasShopifyIntegration = !!(
    activeProduct?.shopifyHandle && activeProduct?.productRefId
  );

  const displayPrice = selectedFormat
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: selectedFormat.currencyCode,
      }).format(parseFloat(selectedFormat.price))
    : activeProduct?.price ?? "$0.00";

  function handleAddToCart() {
    if (!activeProduct) return;

    if (hasShopifyIntegration) {
      if (!selectedFormat) return;
      addToCart({
        id: selectedFormat.shopifyVariantId,
        variantId: selectedFormat.shopifyVariantId,
        name: activeProduct.name,
        size: selectedFormat.displayName,
        style: selectedFormat.aspectRatio,
        price: parseFloat(selectedFormat.price),
        quantity: 1,
        img: activeProduct.img,
      });
    } else {
      addToCart({
        id: activeProduct.productRefId ?? activeProduct.name,
        variantId: activeProduct.productRefId ?? activeProduct.name,
        name: activeProduct.name,
        price: typeof activeProduct.price === "string"
          ? parseFloat(activeProduct.price.replace(/[^0-9.]/g, ""))
          : activeProduct.price,
        quantity: 1,
        img: activeProduct.img,
      });
    }

    router.push("/cart");
  }

  const canAddToCart = hasShopifyIntegration ? !!selectedFormat : !!selectedProduct;

  return (
    <>
      <main className="flex-grow px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* --- Comparison slider --- */}
          <section>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
                The Transformation
              </h1>
              <p className="text-slate-dark/70 text-lg">
                See how we turned your photo into a masterpiece.
              </p>
            </div>
            <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] max-h-[550px] rounded-2xl overflow-hidden shadow-xl select-none group border-4 border-white bg-slate-100">
              <img
                alt="Original dog photo"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5cv5UXI6n4PI_8Ya3Rh-X74jZ0SQxJ7Qej67Loo65G5WVzAOaUkAz3Qfv_imuG0fHz7JgNJuAsTrN1JwDJKKC15QKiuOLVPPRNIBtu7zOtSRPCq628kmg0QnozpKxhCaAqPq7452YJ7RMTTj163JOWTy-QiCukOi_DN-l4a3WJ4b_Dbif5ejxxXmCn121FbjWsEWvZunkUmtiHLTZglsSsOblRw4advHALpiRw07aeJDprARXA7fghypANKLQycDJ-aZWytp98Kn5"
              />
              <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Original
              </div>
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-4 border-primary bg-white/10 z-10">
                <img
                  alt="Artistic dog masterpiece"
                  className="absolute inset-0 w-[200%] max-w-none h-full object-cover object-left"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44"
                />
                <div className="absolute top-6 right-6 bg-primary/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  Masterpiece
                </div>
              </div>
              <div className="absolute inset-y-0 left-1/2 -ml-[22px] flex items-center justify-center pointer-events-none z-20">
                <div className="size-11 bg-primary rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center text-white border-4 border-white">
                  <span className="material-symbols-outlined">code</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- More Variations --- */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-black text-slate-dark tracking-tight font-display">
                More Variations
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { style: "Soft Watercolor", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44" },
                { style: "Minimalist Pencil Sketch", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5cv5UXI6n4PI_8Ya3Rh-X74jZ0SQxJ7Qej67Loo65G5WVzAOaUkAz3Qfv_imuG0fHz7JgNJuAsTrN1JwDJKKC15QKiuOLVPPRNIBtu7zOtSRPCq628kmg0QnozpKxhCaAqPq7452YJ7RMTTj163JOWTy-QiCukOi_DN-l4a3WJ4b_Dbif5ejxxXmCn121FbjWsEWvZunkUmtiHLTZglsSsOblRw4advHALpiRw07aeJDprARXA7fghypANKLQycDJ-aZWytp98Kn5" },
                { style: "Vibrant Pop Art", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5cv5UXI6n4PI_8Ya3Rh-X74jZ0SQxJ7Qej67Loo65G5WVzAOaUkAz3Qfv_imuG0fHz7JgNJuAsTrN1JwDJKKC15QKiuOLVPPRNIBtu7zOtSRPCq628kmg0QnozpKxhCaAqPq7452YJ7RMTTj163JOWTy-QiCukOi_DN-l4a3WJ4b_Dbif5ejxxXmCn121FbjWsEWvZunkUmtiHLTZglsSsOblRw4advHALpiRw07aeJDprARXA7fghypANKLQycDJ-aZWytp98Kn5" },
              ].map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md transition-all flex flex-col group h-full">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-100 relative shadow-inner">
                    <img alt={v.style} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={v.img} />
                  </div>
                  <h3 className="text-center font-bold text-slate-dark mb-3 text-lg">{v.style}</h3>
                  <button className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow hover:shadow-lg transition-all transform active:scale-95 mt-auto">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* --- Step 1: Choose product type --- */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="size-8 rounded-full bg-slate-dark text-white flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h2 className="text-2xl font-black text-slate-dark tracking-tight font-display">
                Choose Your Perfect Canvas
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {products.map((p) => {
                const isSelected = selectedProduct === p.name;
                return (
                  <label
                    key={p.name}
                    className="group relative cursor-pointer block h-full"
                    onClick={() => onProductSelect(p.name)}
                  >
                    <input
                      checked={isSelected}
                      className="peer sr-only"
                      name="product_type"
                      type="radio"
                      readOnly
                    />
                    <div className={`h-full bg-white rounded-2xl p-4 shadow-sm border-2 transition-all hover:shadow-md flex flex-col ${isSelected ? "border-primary bg-primary/5" : "border-transparent"}`}>
                      <div className="aspect-[16/10] bg-[#F5F5F0] rounded-xl mb-4 flex items-center justify-center p-6 relative overflow-hidden">
                        <div className="relative w-56 aspect-[4/3] group-hover:scale-105 transition-transform duration-500 shadow-xl rounded bg-white overflow-hidden">
                          <img className="w-full h-full object-cover rounded opacity-90" src={p.img} alt={p.name} />
                          {p.badge && (
                            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide text-slate-dark shadow-sm">
                              {p.badge}
                            </div>
                          )}
                          {p.tag && (
                            <div className="absolute bottom-0 w-full bg-primary/90 text-white text-center text-[10px] py-1.5 font-bold uppercase tracking-widest">
                              {p.tag}
                            </div>
                          )}
                          {p.hasPlay && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="size-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-xl animate-pulse">play_circle</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary z-20">
                            <span className="material-symbols-outlined text-3xl bg-white rounded-full">check_circle</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <h3 className="text-lg font-bold text-slate-dark">{p.name}</h3>
                          <p className="text-sm text-slate-dark/60">{p.desc}</p>
                        </div>
                        <span className="text-xl font-bold text-primary">{p.price}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* --- Step 2: Choose size/format (only when product has Shopify integration) --- */}
          {hasShopifyIntegration && (
            <section className="pb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="size-8 rounded-full bg-slate-dark text-white flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h2 className="text-2xl font-black text-slate-dark tracking-tight font-display">
                  Choose Your Size
                </h2>
              </div>
              <FormatSelector
                formats={formats}
                selectedFormatId={selectedFormat?.formatId ?? null}
                onFormatSelect={onFormatSelect}
                isLoading={isLoading}
                error={error}
              />
            </section>
          )}
        </div>
      </main>

      {/* --- Sticky footer --- */}
      <div className="sticky bottom-0 z-40 bg-white/80 backdrop-blur-md border-t border-[#E5E0D8] p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-dark/70">
                Estimated Delivery:{" "}
                <span className="font-bold text-slate-dark">Oct 24 - Oct 28</span>
              </p>
              <p className="text-xs text-slate-dark/50 font-medium">Free shipping included</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden md:block text-right mr-2">
              <span className="block text-xs text-slate-dark/60 uppercase font-black tracking-widest">Total</span>
              <span className="block text-xl font-black text-slate-dark tracking-tight">{displayPrice}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="w-full md:w-auto min-w-[260px] flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {hasShopifyIntegration && !selectedFormat
                ? "Select a Size"
                : "Add to Cart & Checkout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
