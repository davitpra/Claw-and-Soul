"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormatOptions, FormatOption } from "@/hooks/useFormatOptions";
import { Product } from "@/entities/pet-product/model/types";
import { FormatSelector } from "./FormatSelector";
import { IAGenerationCanvas } from "./IAGenerationCanvas";
import { useCart } from "@/context/CartContext";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerationStatus, GenerationStatus } from "@/hooks/useGenerationStatus";

interface IAPreviewStepProps {
  products: Product[];
  selectedProduct: string;
  onProductSelect: (name: string) => void;
  selectedFormat: FormatOption | null;
  onFormatSelect: (format: FormatOption) => void;
  preSelectedFormatId?: string | null;
  isLoadingProducts?: boolean;
  productsError?: string | null;
  petId: string | null;
  petPhotoId: string | null;
  petPhotoUrl: string | null;
  styleId: string | null;
  onGenerationStatusChange?: (status: GenerationStatus) => void;
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
  petId,
  petPhotoId,
  petPhotoUrl,
  styleId,
  onGenerationStatusChange,
}: IAPreviewStepProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const activeProduct = products.find((p) => p.name === selectedProduct);
  const { formats, isLoading, error } = useFormatOptions(
    activeProduct?.shopifyHandle ?? null,
  );

  const { generate, isCreating, error: generateError } = useGenerateImage();
  const [generationId, setGenerationId] = useState<string | null>(null);
  const {
    status,
    progress,
    imageUrl,
    error: pollError,
  } = useGenerationStatus(generationId);

  // Propagate generation status to parent (for header indicator)
  useEffect(() => {
    onGenerationStatusChange?.(status);
  }, [status, onGenerationStatusChange]);

  // Auto-select format from URL param once formats are loaded
  useEffect(() => {
    if (!preSelectedFormatId || selectedFormat || formats.length === 0) return;
    const match = formats.find((f) => f.formatId === preSelectedFormatId);
    if (match) onFormatSelect(match);
  }, [formats, preSelectedFormatId, selectedFormat, onFormatSelect]);

  const hasShopifyIntegration = !!(
    activeProduct?.shopifyHandle && activeProduct?.productRefId
  );

  const canGenerate =
    !!petId &&
    !!styleId &&
    !!selectedFormat &&
    !!(activeProduct?.productRefId);

  const displayPrice = selectedFormat
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: selectedFormat.currencyCode,
      }).format(parseFloat(selectedFormat.price))
    : activeProduct?.price ?? "$0.00";

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !petId || !styleId || !selectedFormat || !activeProduct?.productRefId) return;
    try {
      const result = await generate({
        petId,
        petPhotoId: petPhotoId ?? undefined,
        styleId,
        formatId: selectedFormat.formatId,
        productRefId: activeProduct.productRefId,
      });
      setGenerationId(result.id);
    } catch {
      // error tracked in useGenerateImage
    }
  }, [canGenerate, petId, petPhotoId, styleId, selectedFormat, activeProduct, generate]);

  const handleRetry = useCallback(() => {
    setGenerationId(null);
    handleGenerate();
  }, [handleGenerate]);

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
        img: imageUrl ?? activeProduct.img,
        generationId: generationId ?? undefined,
        imageUrl: imageUrl ?? undefined,
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
        img: imageUrl ?? activeProduct.img,
        generationId: generationId ?? undefined,
        imageUrl: imageUrl ?? undefined,
      });
    }

    router.push("/cart");
  }

  const generationLoading = isCreating || status === "pending" || status === "processing";
  const generationDone = status === "completed";
  const generationFailed = status === "failed";

  // Footer CTA logic
  const footerLabel = (() => {
    if (!selectedFormat && hasShopifyIntegration) return "Selecciona un tamaño";
    if (generationLoading) return "Generando...";
    if (generationFailed) return "Reintentar";
    if (generationDone) return "Add to Cart & Checkout";
    return "Generar arte ✨";
  })();

  const footerDisabled =
    (!selectedFormat && hasShopifyIntegration) ||
    generationLoading ||
    (!canGenerate && !generationDone);

  const handleFooterClick = () => {
    if (generationFailed) {
      handleRetry();
    } else if (generationDone) {
      handleAddToCart();
    } else if (canGenerate) {
      handleGenerate();
    }
  };

  return (
    <>
      <main className="flex-grow px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* --- Generation canvas --- */}
          <section>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
                {generationDone ? "¡Tu obra de arte!" : "Genera tu arte"}
              </h1>
              <p className="text-slate-dark/70 text-lg">
                {generationDone
                  ? "Mira la transformación de tu mascota."
                  : "Selecciona el producto y tamaño, luego genera tu imagen."}
              </p>
            </div>
            <IAGenerationCanvas
              status={status}
              isCreating={isCreating}
              imageUrl={imageUrl}
              petPhotoUrl={petPhotoUrl}
              progress={progress}
              error={generateError ?? pollError}
              onRetry={handleRetry}
            />
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
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-32">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                  progress_activity
                </span>
              </div>
            ) : productsError ? (
              <p className="text-red-500 text-sm">{productsError}</p>
            ) : (
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            )}
          </section>

          {/* --- Step 2: Choose size/format --- */}
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
              onClick={handleFooterClick}
              disabled={footerDisabled}
              className="w-full md:w-auto min-w-[260px] flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {generationLoading ? (
                <>
                  <span className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generando...
                </>
              ) : generationDone ? (
                <>
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Add to Cart & Checkout
                </>
              ) : generationFailed ? (
                <>
                  <span className="material-symbols-outlined">refresh</span>
                  Reintentar
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {footerLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
