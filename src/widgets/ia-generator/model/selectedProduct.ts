// Producto + formato ya resueltos con los que entra el generador. Se arma en
// `app/ia-generator/page.tsx` a partir de los query params del deep-link
// (`product_ref_id` + `format_id`) y viaja hasta el paso de upload.
export type SelectedProductInfo = {
  shopifyVariantId: string;
  price: string;
  currencyCode: string;
  productTitle: string;
  productImage: string;
  formatLabel: string;
  // Formato de entrega del backend (Digital | Canvas | Poster…); "PBN" legacy.
  // Digital es gratuito: el flujo de generación lo usa para omitir el carrito.
  template: string | null;
  // Dimensiones físicas del formato elegido, en cm (leídas del valor de la
  // talla de Shopify, no de los píxeles del backend). Escalan la obra colgada
  // en el paso de agradecimiento (IAThanksStep).
  formatWidth: number | null;
  formatHeight: number | null;
};
