import Link from "next/link";
import { Product } from "@/entities/pet-product/model/types";
import { toFrameStyle, FRAME_SHADOWS } from "@/entities/product/lib/frameStyle";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";

interface SimilarSoulsCardProps {
  /** Producto similar ya resuelto (name, desc, price, img, shopifyHandle). */
  product: Product;
}

/**
 * Card vertical de la sección "Similar Souls": imagen enlazada al producto,
 * nombre alineado a la izquierda, dos líneas de descripción y una fila inferior
 * con el precio y un CTA teal "View product". Sin icono de wishlist (no hay
 * feature de favoritos). El ancho lo define el contenedor (celda del carrusel).
 */
export function SimilarSoulsCard({ product }: SimilarSoulsCardProps) {
  // Sin handle no podemos enlazar al detalle: la card se muestra sin enlaces.
  const href = product.shopifyHandle
    ? `/product/${product.shopifyHandle}`
    : undefined;

  // Presentación de la imagen según el tipo (Canvas/Poster/Art), igual que en la
  // galería del detalle. El `bg-white` de la card sirve de fondo del margen del
  // póster. `overflow-hidden` recortaría la sombra del frame, por eso no se usa.
  const frameStyle = toFrameStyle(product.template);
  const framedImage = (
    <div className="relative hover:-translate-y-1 shadow-sm ease-out  hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.35)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.img}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={`block w-full h-auto bg-white ${FRAME_SHADOWS[frameStyle]} `}
      />
      {frameStyle === "canvas" && <CanvasEdgeOverlay />}
    </div>
  );

  return (
    <div className="group flex h-full w-full flex-col gap-4 rounded-2xl border-2 border-cream bg-white p-4 ">
      {href ? (
        <Link href={href} className="block" aria-label={product.name}>
          {framedImage}
        </Link>
      ) : (
        framedImage
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="font-display text-lg font-black leading-tight text-slate-dark">
          {product.name}
        </h3>

        {product.desc && (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
            {product.desc}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {product.price && (
            <span className="font-display text-lg font-black leading-none text-primary">
              {product.price}
            </span>
          )}

          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark"
            >
              View product
              <span className="material-symbols-outlined text-[18px]">
                shopping_cart
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
