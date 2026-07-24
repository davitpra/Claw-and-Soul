import { cloudinaryThumb } from "@/shared/lib/cloudinary";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";
import type { Product } from "@/entities/pet-product/model/types";
import { resolveItemImage } from "../lib/presentation";
import type { OrderItemThumb } from "../types";

interface OrderItemRowProps {
  item: OrderItemThumb;
  /** Mapa `variantNumericId → url` para resolver la imagen live de Shopify de
   *  ítems sin imagen persistida (accesorios). Ver `useShopifyVariantImages`. */
  variantImages?: Record<string, string>;
}

/**
 * Item de una orden renderizado como poster con `ProductCard`.
 * El item solo trae título e imagen, así que se mapea a un `Product` mínimo sin
 * precio ni badge; al no tener handle de Shopify, la card no enlaza a producto.
 * Pensado para componerse dentro de una `<ul>` con layout de grilla.
 */
export function OrderItemRow({ item, variantImages = {} }: OrderItemRowProps) {
  const thumb = resolveItemImage(item, variantImages);
  const product: Product = {
    name: item.title,
    desc: "",
    price: "",
    img: cloudinaryThumb(thumb, 480),
  };

  return (
    <li className="min-w-0">
      <ProductCard
        product={product}
        showPrice={false}
        showBadge={true}
        zoomable={Boolean(thumb)}
        zoomSrc={thumb || undefined}
      />
    </li>
  );
}
