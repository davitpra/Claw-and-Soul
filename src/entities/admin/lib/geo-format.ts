/**
 * Presentación de la ubicación estimada por IP. El backend devuelve el código
 * ISO del país; el nombre en español se resuelve aquí, que es donde vive la
 * capa de presentación.
 */

import type { AdminGeoLocation } from "../api";

// `Intl.DisplayNames` es caro de construir: una instancia para toda la app.
const REGION_NAMES = new Intl.DisplayNames(["es"], { type: "region" });

/** `ES` → `España`. Devuelve el código tal cual si no lo reconoce. */
export function countryName(code: string): string {
  try {
    return REGION_NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Ubicación en una línea, degradando según lo que traiga la base: la GeoLite2
 * gratuita casi siempre tiene país y muy pocas veces ciudad.
 *
 * Cuando no hay ciudad ni región se usa la zona horaria, que localiza mejor que
 * un país suelto (`Europe/Madrid` dice más que `España` en un país grande).
 */
export function fmtLocation(location: AdminGeoLocation | null): string {
  if (!location) return "—";

  const country = countryName(location.country);
  const local = location.city || location.region;

  if (local) return `${local}, ${country}`;

  if (location.timezone) {
    // `Europe/Madrid` → `Madrid`: la parte de la región solo repite el país.
    const zone = location.timezone.split("/").pop()?.replace(/_/g, " ");
    if (zone) return `${zone}, ${country}`;
  }

  return country;
}

/**
 * Emoji de bandera desde el código ISO. Cada letra se mapea a su símbolo
 * indicador regional, que el sistema compone en una bandera.
 */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}
