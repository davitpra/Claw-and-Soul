export interface Product {
  name: string;
  desc: string;
  price: string;
  /** Precio comparativo (de lista) ya formateado, para mostrarlo tachado cuando hay oferta. */
  compareAtPrice?: string;
  /** Porcentaje de descuento (entero positivo) cuando el producto está en oferta. */
  discountPercent?: number;
  img: string;
  badge?: string;
  tag?: string;
  hasPlay?: boolean;
  shopifyHandle?: string;
  productRefId?: string;
  label?: string;
  /** Formato de entrega del storefront configurado en el admin (Digital, Canvas, Poster…). */
  template?: string | null;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); vacío/null si no está asignado. */
  artKind?: string | null;
  /** Marca los kits Paint-by-Numbers; habilita mostrar la dificultad en la card. */
  isPaintByNumbers?: boolean;
  /** Dificultad del estilo (easy/medium/challenging); solo se muestra en PBN. */
  difficulty?: string;
}
