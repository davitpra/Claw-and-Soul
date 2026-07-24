import { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { ImageZoom } from "@/shared/ui/ImageZoom";
import { Product } from "@/entities/pet-product/model/types";
import {
  DIFFICULTY_LABELS,
  StyleDifficulty,
} from "@/entities/art-style/model/difficulty";
import type { FrameStyle } from "@/entities/product/lib/frameStyle";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";

// Aspecto de "poster flotando": ligera elevación y sombra teñida en teal al hover.
export const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

// Efecto por tipo de producto en la card (mismo lenguaje visual que la galería
// del producto): "canvas" con sombra de canto + oscurecido interior de bordes;
// "poster" con margen de papel blanco y línea hairline; "accessory" es una foto
// de producto con sombra suave apoyada; "art" queda plano.
const FRAME_CLASS: Record<FrameStyle, string> = {
  art: "",
  canvas: "shadow-[6px_8px_16px_-8px_rgba(16,54,66,0.42)]",
  poster: "border border-black/10 p-2",
  accessory: "p-4 shadow-[0_12px_28px_-14px_rgba(16,54,66,0.28)]",
  // Los créditos usan un layout de "moneda flotante" propio (ver más abajo), no
  // el <Card>, así que estas clases no se aplican.
  credits: "",
};

interface ProductCardProps {
  product: Product;
  /** Texto del badge superpuesto. Si no se resuelve un valor, no se muestra badge. */
  label?: string;
  /** Badge del contenido de la obra ("Paint by Numbers" / "Print Art"). Se apila sobre el resto. */
  artKindBadge?: string;
  /** Muestra el precio del producto debajo del nombre. */
  showPrice?: boolean;
  /** CTA opcional renderizado bajo el precio (p. ej. "Personalize with AI"). */
  cta?: ReactNode;
  showBadge?: boolean;
  /** Efecto de marco según el tipo de producto (canvas/poster). Por defecto "art" (plano). */
  frameStyle?: FrameStyle;
  /** Muestra la imagen en su proporción natural (alto variable) en vez de recortarla. */
  naturalAspect?: boolean;
  /** Sobreescribe el href del link de la imagen. Por defecto: /product/{shopifyHandle}. */
  href?: string;
  /** Permite ampliar la imagen al hacer click. Se ignora si la card enlaza a un producto. */
  zoomable?: boolean;
  /** Imagen a resolución completa que se carga solo al ampliar. Requiere `zoomable`. */
  zoomSrc?: string;
  /** Se invoca si la imagen no carga, para poder mostrar un fallback en su lugar. */
  onImageError?: () => void;
}

/**
 * Tarjeta de producto "poster" reutilizable de Claw & Soul.
 * Es agnóstica al ancho: ocupa el 100% de su contenedor, por lo que el ancho lo
 * define el padre (celda de grilla o item de carrusel con `flex-[0_0_...]`).
 */
export function ProductCard({
  product,
  label,
  artKindBadge,
  showPrice,
  cta,
  showBadge = true,
  frameStyle = "art",
  naturalAspect = false,
  href,
  zoomable = false,
  zoomSrc,
  onImageError,
}: ProductCardProps) {
  const badge = label ?? product.label;
  // En los coloreables (contenido PBN, en cualquier formato) mostramos qué tan
  // difícil es pintarlos. El kit dedicado es agnóstico al estilo, así que si no
  // tiene una dificultad concreta asignada mostramos "All levels" en su lugar.
  const difficultyLabel = product.isPaintByNumbers
    ? (DIFFICULTY_LABELS[product.difficulty as StyleDifficulty] ?? "All levels")
    : null;
  // Sin href explícito ni handle de Shopify (p. ej. items de una orden) la card no
  // enlaza a ningún sitio: se renderiza sin `<Link>` en vez de a `/product/undefined`.
  const linkHref =
    href ??
    (product.shopifyHandle ? `/product/${product.shopifyHandle}` : undefined);

  // Los accesorios son fotos de producto: se sienten "apoyados", así que no
  // reciben el lift al hover (translate + sombra profunda) del resto de tipos.
  const hoverClasses =
    frameStyle === "accessory"
      ? "transition-all duration-300 ease-out"
      : posterClasses;

  const poster = (
    <Card
      imageUrl={product.img}
      imageAlt={product.name}
      onImageError={onImageError}
      naturalAspect={naturalAspect}
      className={`${hoverClasses} ${FRAME_CLASS[frameStyle]}`}
    >
      {/* Oscurecido interior de bordes del canvas (va primero para no teñir el
          badge, que se pinta encima). */}
      {frameStyle === "canvas" && <CanvasEdgeOverlay />}
      <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
        {artKindBadge && (
          <span className="bg-white text-slate-dark text-[10px] font-bold uppercase px-4 py-1 rounded-full tracking-wider">
            {artKindBadge}
          </span>
        )}
        {difficultyLabel ? (
          <span className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold uppercase px-4 py-1 rounded-full tracking-wider">
            <span className="material-symbols-outlined text-[14px]">brush</span>
            {difficultyLabel}
          </span>
        ) : (
          showBadge &&
          badge && (
            <span className="bg-primary text-white text-[10px] font-bold uppercase px-4 py-1 rounded-full tracking-wider">
              {badge}
            </span>
          )
        )}
      </div>
    </Card>
  );

  // Los créditos no son una obra: son saldo. En vez del <Card> rectangular se
  // presentan como una "moneda flotante" — imagen recortada a círculo con canto,
  // resplandor teal y una sombra elíptica que late mientras la moneda flota en
  // bucle (animaciones idle en globals.css, desactivadas con reduce-motion).
  const coin = (
    <div className="mx-auto w-3/4">
      <div className="animate-coin-float aspect-square w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={onImageError}
          className="h-full w-full rounded-full object-cover ring-4 ring-white outline outline-1 outline-primary/30 shadow-[0_14px_30px_-8px_rgba(16,54,66,0.45)]"
        />
      </div>
      <div
        aria-hidden
        className="animate-coin-shadow mx-auto mt-2 h-3 w-1/2 rounded-[50%] bg-[rgba(16,54,66,0.28)] blur-md"
      />
    </div>
  );

  const media = frameStyle === "credits" ? coin : poster;

  return (
    <div className="group flex w-full min-w-0 flex-col gap-2">
      {linkHref ? (
        <Link href={linkHref} className="block">
          {media}
        </Link>
      ) : zoomable ? (
        <ImageZoom alt={product.name} zoomSrc={zoomSrc}>
          {media}
        </ImageZoom>
      ) : (
        media
      )}

      <div className="flex flex-col items-center gap-1">
        <h3 className="font-display font-black text-slate-dark md:text-lg text-center">
          {product.name}
        </h3>

        {showPrice && product.price && (
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-primary">{product.price}</span>
            {product.compareAtPrice && (
              <span className="text-slate-dark/50 line-through">
                {product.compareAtPrice}
              </span>
            )}
            {product.discountPercent ? (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wider">
                -{product.discountPercent}%
              </span>
            ) : null}
          </div>
        )}

        {/* Personalizar con IA se paga con saldo, no con dinero: 1 crédito por
            obra. Se muestra junto al precio para dejar claro el costo del kit.
            Los accesorios (foto de producto) y los propios packs de créditos no
            se personalizan, así que se excluyen. */}
        {showPrice &&
          frameStyle !== "accessory" &&
          frameStyle !== "credits" && (
          <p className="flex items-center gap-1 text-xs font-semibold text-slate-dark/60">
            <span className="material-symbols-outlined text-[14px] text-primary">
              paid
            </span>
            1 credit
          </p>
        )}

        {cta}
      </div>
    </div>
  );
}
