"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/Container";
import { useRouter } from "next/navigation";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";
import {
  toFrameStyle,
  POSTER_FRAME,
} from "@/entities/product/lib/frameStyle";
import {
  setSunlightStyle,
  setAmbientStyle,
} from "@/entities/product/lib/setLighting";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";
import { useCart } from "@/context/CartContext";
import { useShopifyCheckout } from "@/hooks/useShopifyCheckout";

// Escala de la imagen del producto centrada según el formato elegido. Tuneables:
const BASE_WIDTH_PCT = 90; // % del panel que ocupa el lado mayor del formato de referencia
const REFERENCE_MAX_CM = 50; // lado (cm) del formato que alcanza BASE_WIDTH_PCT
const MIN_SCALE = 0.4; // el formato más pequeño nunca baja de esto

interface IAThanksStepProps {
  generationId?: string | null;
  productImage?: string | null;
  formatWidth?: number | null;
  formatHeight?: number | null;
  template?: string | null;
}

export function IAThanksStep({
  generationId,
  productImage,
  formatWidth,
  formatHeight,
  template,
}: IAThanksStepProps) {
  const router = useRouter();

  // La presentación del cuadro (lienzo / póster / plano) se deriva del tipo de
  // producto, igual que en el resto de la app (ProductGallery, Hero, etc.).
  const frameStyle = toFrameStyle(template);

  // La petición de generación ya se disparó antes de llegar aquí; hacemos
  // polling hasta tener el resultado y lo mostramos en lugar del mockup.
  const { status, imageUrl } = useGenerationStatus(generationId ?? null);
  const displayImage = imageUrl ?? productImage;
  // Sin generationId no hay nada que esperar; en "failed" el mockup queda
  // estático (el copy ya cubre el fallback por email).
  const isGenerating = !!generationId && !imageUrl && status !== "failed";

  // El CTA de PBN queda en suspenso hasta que la imagen generada aparece en
  // pantalla (imageUrl del polling); solo entonces se puede convertir.
  const pbnReady = !!imageUrl;
  const goToPbnStudio = () => {
    if (!imageUrl) return;
    const params = new URLSearchParams();
    if (generationId) params.set("generationId", generationId);
    params.set("imageUrl", imageUrl);
    router.push(`/studio?${params.toString()}`);
  };

  // El arte no-Digital ya se agregó al carrito en el paso de upload; solo
  // ofrecemos checkout cuando el carrito tiene items.
  const { cartCount } = useCart();
  const { startCheckout, isCheckingOut } = useShopifyCheckout();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // Solo ofrecemos checkout/carrito cuando la imagen generada ya está lista
  // (pbnReady) y hay algo en el carrito.
  const showCheckout = cartCount > 0 && pbnReady;

  const handleCheckout = async () => {
    setCheckoutError(null);
    const result = await startCheckout();
    if (result.status === "no-variants") {
      setCheckoutError(
        "This item isn't available for checkout yet. Please try from your cart.",
      );
    } else if (result.status === "error") {
      setCheckoutError(
        result.message ?? "Something went wrong. Please try again.",
      );
    }
  };

  // El cuadro adopta la proporción real del formato y escala con su tamaño
  // físico (lado mayor). Sin dimensiones válidas caemos al ancho base con la
  // proporción natural de la imagen.
  const hasDims =
    !!formatWidth && !!formatHeight && formatWidth > 0 && formatHeight > 0;
  let widthPct = BASE_WIDTH_PCT;
  let aspectRatio: string | undefined;
  if (hasDims) {
    const w = formatWidth as number;
    const h = formatHeight as number;
    const longSide = Math.max(w, h);
    const scale = Math.min(Math.max(longSide / REFERENCE_MAX_CM, MIN_SCALE), 1);
    // El lado mayor ocupa la misma huella sin importar la orientación: en
    // retrato es la altura, así que reducimos el ancho por (w/h).
    widthPct =
      w >= h ? BASE_WIDTH_PCT * scale : BASE_WIDTH_PCT * scale * (w / h);
    aspectRatio = `${w} / ${h}`;
  }

  return (
    <main className="grow flex flex-col bg-white">
      <section>
        {/* Left — image, half screen */}
        <Container>
          <div className="flex-1 flex flex-col md:flex-row animate-in fade-in duration-700">
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center min-h-72 md:min-h-0">
              <div className="relative flex items-center justify-center overflow-hidden bg-white w-full max-w-2xl aspect-3/4 max-h-screen">
                {displayImage && (
                  // Imagen del producto centrada y escalada a la proporción y al
                  // tamaño del formato elegido. Conserva sombra + lienzo + luz.
                  <div
                    className={`relative shadow-[10px_12px_26px_-10px_rgba(96,66,38,0.40),2px_3px_6px_-2px_rgba(96,66,38,0.30)] ${
                      frameStyle === "poster" ? POSTER_FRAME : ""
                    }`}
                    style={{
                      width: `${widthPct}%`,
                      ...(aspectRatio ? { aspectRatio } : {}),
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt="Your personalized artwork"
                      loading="lazy"
                      decoding="async"
                      className={`animate-in fade-in duration-700 ${
                        aspectRatio
                          ? "block h-full w-full object-cover"
                          : "block h-auto w-full"
                      }`}
                      style={{
                        filter: "brightness(0.98) saturate(0.94) sepia(0.06)",
                      }}
                    />
                    {frameStyle === "canvas" && <CanvasEdgeOverlay />}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={setSunlightStyle}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={setAmbientStyle}
                    />
                    {isGenerating && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 animate-pulse bg-white/40"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right — text content, half screen */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-10 py-14 bg-white">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-5 max-w-sm w-full">
                <span className="material-symbols-outlined text-primary text-3xl">
                  favorite
                </span>

                <h1 className="font-display text-5xl md:text-6xl font-black text-slate-dark tracking-tight leading-none">
                  Thank you!
                </h1>

                <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                  <div className="h-px flex-1 max-w-30 bg-[#E0DED9]" />
                </div>

                <p className="text-slate-dark/70 text-base leading-relaxed">
                  We&apos;re crafting your artwork right now. As soon as
                  it&apos;s ready, we&apos;ll send it to your email. You can
                  also find it in your profile.
                </p>

                <div className="flex flex-col items-center gap-3 mt-2 w-full">
                  <button
                    onClick={goToPbnStudio}
                    disabled={!pbnReady}
                    aria-busy={!pbnReady}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm disabled:hover:bg-primary"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        pbnReady ? "" : "animate-spin"
                      }`}
                    >
                      {pbnReady ? "format_paint" : "progress_activity"}
                    </span>
                    {pbnReady
                      ? "Turn into Paint by Numbers"
                      : "Preparing your artwork…"}
                  </button>

                  {showCheckout && (
                    <>
                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        aria-busy={isCheckingOut}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E0DED9] text-slate-dark hover:bg-gray-50 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isCheckingOut ? "animate-spin" : ""
                          }`}
                        >
                          {isCheckingOut
                            ? "progress_activity"
                            : "shopping_cart_checkout"}
                        </span>
                        {isCheckingOut ? "Redirecting…" : "Proceed to Checkout"}
                      </button>
                      <button
                        onClick={() => router.push("/cart")}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E0DED9] text-slate-dark hover:bg-gray-50 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          shopping_cart
                        </span>
                        View Cart
                      </button>
                      {checkoutError && (
                        <p className="text-sm text-red-600 text-center">
                          {checkoutError}
                        </p>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => router.push("/user")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E0DED9] text-slate-dark hover:bg-gray-50 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    Go to Profile
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E0DED9] text-slate-dark hover:bg-gray-50 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      storefront
                    </span>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
