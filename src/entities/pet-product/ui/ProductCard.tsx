import { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Product } from "@/entities/pet-product/model/types";

// Aspecto de "poster flotando": ligera elevación y sombra teñida en teal al hover.
export const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

interface ProductCardProps {
  product: Product;
  /** Texto del badge superpuesto. Si no se resuelve un valor, no se muestra badge. */
  label?: string;
  /** Muestra el precio del producto debajo del nombre. */
  showPrice?: boolean;
  /** CTA opcional renderizado bajo el precio (p. ej. "Personalize with AI"). */
  cta?: ReactNode;
  showBadge?: boolean;
}

/**
 * Tarjeta de producto "poster" reutilizable de Claw & Soul.
 * Es agnóstica al ancho: ocupa el 100% de su contenedor, por lo que el ancho lo
 * define el padre (celda de grilla o item de carrusel con `flex-[0_0_...]`).
 */
export function ProductCard({
  product,
  label,
  showPrice,
  cta,
  showBadge = true,
}: ProductCardProps) {
  const badge = label ?? product.label;

  return (
    <div className="group flex w-full min-w-0 flex-col gap-4">
      <Link href={`/product/${product.shopifyHandle}`} className="block">
        <Card
          imageUrl={product.img}
          imageAlt={product.name}
          naturalAspect
          className={posterClasses}
        >
          {showBadge && badge && (
            <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
              {badge}
            </span>
          )}
        </Card>
      </Link>

      <div className="flex flex-col items-center gap-3">
        <h3 className="font-black text-slate-dark md:text-lg font-display text-center">
          {product.name}
        </h3>

        {showPrice && product.price && (
          <div className="flex items-center gap-2">
            <span className="text-slate-dark">{product.price}</span>
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

        {cta}
      </div>
    </div>
  );
}
