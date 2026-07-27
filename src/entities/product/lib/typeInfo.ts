export interface TypeInfo {
  /** Una línea; se muestra siempre bajo los chips. */
  short: string;
  /** Descripción larga del desplegable. */
  long: string;
}

// Los valores de la opción `Type` de Shopify son jerga de impresión (un
// comprador no distingue "Wrapped" de "Framed"), así que cada uno lleva su
// explicación aquí. Mismo patrón que las constantes de `ProductPerks`.
const TYPE_INFO: Record<string, TypeInfo> = {
  rolled: {
    short: "Unframed, ships rolled",
    long: "Your pet's portrait printed on premium matte canvas, shipped rolled in a protective tube. A budget-friendly option — perfect if you already have a frame in mind or want to faster shipping.",
  },
  wrapped: {
    short: "Ready to hang, no frame needed.",
    long: "Printed on artist-grade canvas and hand-stretched over a solid wood frame, with the image wrapped around the edges for a clean, modern look. Arrives ready to hang — no assembly required.",
  },
  framed: {
    short: "Gallery wrapped + premium frame.",
    long: "Our gallery wrapped canvas finished with a premium wood frame for an elevated, gallery-quality presentation. The perfect statement piece for your pet's portrait — ready to hang straight out of the box.",
  },
};

/**
 * Copy del valor de `Type` seleccionado, o `undefined` si no está descrito —
 * así una variante nueva creada desde Shopify simplemente no muestra texto en
 * vez de romper la ficha.
 */
export function getTypeInfo(value: string): TypeInfo | undefined {
  return TYPE_INFO[value.trim().toLowerCase()];
}
