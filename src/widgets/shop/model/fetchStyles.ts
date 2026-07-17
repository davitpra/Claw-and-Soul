import { BackendProductLite, StyleData } from "./types";

// URL base de la API del backend, donde se configura el estilo de arte de cada producto.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Resuelve el estilo de arte de cada producto desde el backend (donde vive).
 * Si el backend falla o no responde, devuelve mapas vacíos: el shop sigue
 * funcionando y los grupos de filtro "Style"/"Difficulty" no se muestran.
 */
export async function fetchStyles(): Promise<StyleData> {
  const byHandle = new Map<string, string>();
  const templateByHandle = new Map<string, string>();
  const difficultyByHandle = new Map<string, string>();
  const pbnHandles = new Set<string>();
  const categoryByStyle = new Map<string, string>();
  const result: StyleData = {
    byHandle,
    templateByHandle,
    difficultyByHandle,
    pbnHandles,
    pbnKitHandle: null,
    creditPackHandle: null,
    categoryByStyle,
  };
  try {
    const res = await fetch(`${API_URL}/products`, { credentials: "include" });
    if (!res.ok) return result;
    const json = (await res.json()) as
      | { data: BackendProductLite[] }
      | BackendProductLite[];
    const list = Array.isArray(json) ? json : json.data;
    for (const bp of list) {
      if (!bp.shopifyHandle) continue;
      // El template del backend es el tipo de producto canónico del storefront.
      if (bp.template) templateByHandle.set(bp.shopifyHandle, bp.template);
      // Un producto es PBN si es el kit dedicado o si usa el template "PBN".
      if (bp.isPaintByNumbers || bp.template === "PBN")
        pbnHandles.add(bp.shopifyHandle);
      // Los roles dedicados (marcados en el admin) son únicos y tienen su propia
      // landing: el kit PBN → /paint-by-numbers, el Credit Pack → /credits.
      if (bp.isPaintByNumbers) result.pbnKitHandle = bp.shopifyHandle;
      if (bp.isCreditPack) result.creditPackHandle = bp.shopifyHandle;
      const name = bp.style?.displayName;
      if (!name) continue;
      byHandle.set(bp.shopifyHandle, name);
      if (bp.style?.difficulty)
        difficultyByHandle.set(bp.shopifyHandle, bp.style.difficulty);
      if (bp.style?.category) categoryByStyle.set(name, bp.style.category);
    }
    return result;
  } catch {
    return result;
  }
}
