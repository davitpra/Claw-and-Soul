"use client";

import { Container } from "@/shared/ui/Container";
import { useRouter } from "next/navigation";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";
import {
  setSunlightStyle,
  setAmbientStyle,
} from "@/entities/product/lib/setLighting";

// Escala de la imagen del producto centrada según el formato elegido. Tuneables:
const BASE_WIDTH_PCT = 90; // % del panel que ocupa el lado mayor del formato de referencia
const REFERENCE_MAX_CM = 50; // lado (cm) del formato que alcanza BASE_WIDTH_PCT
const MIN_SCALE = 0.4; // el formato más pequeño nunca baja de esto

interface IAThanksStepProps {
  productImage?: string | null;
  formatWidth?: number | null;
  formatHeight?: number | null;
}

export function IAThanksStep({
  productImage,
  formatWidth,
  formatHeight,
}: IAThanksStepProps) {
  const router = useRouter();

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
                {productImage && (
                  // Imagen del producto centrada y escalada a la proporción y al
                  // tamaño del formato elegido. Conserva sombra + lienzo + luz.
                  <div
                    className="relative shadow-[10px_12px_26px_-10px_rgba(96,66,38,0.40),2px_3px_6px_-2px_rgba(96,66,38,0.30)]"
                    style={{
                      width: `${widthPct}%`,
                      ...(aspectRatio ? { aspectRatio } : {}),
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productImage}
                      alt="Your personalized artwork"
                      loading="lazy"
                      decoding="async"
                      className={
                        aspectRatio
                          ? "block h-full w-full object-cover"
                          : "block h-auto w-full"
                      }
                      style={{
                        filter: "brightness(0.98) saturate(0.94) sepia(0.06)",
                      }}
                    />
                    <CanvasEdgeOverlay />
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
                    onClick={() => router.push("/user")}
                    className="w-full  flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-105"
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
