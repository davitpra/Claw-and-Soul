import type { ProcessStep } from "@/widgets/ai-process";
import {
  PRODUCT_PROCESS_STEPS,
  PRODUCT_PBN_PROCESS_STEPS,
  DIGITAL_PROCESS_STEPS,
} from "./processSteps";

// Reglas por tipo de producto del template de arte (Digital | Canvas | Poster).
// Viven acá y no dentro del componente para que las diferencias entre formatos
// se lean de un vistazo, como el resto de los mapas por template del repo
// (TEMPLATE_LABELS, FRAME_SHADOWS, PERKS/DIGITAL_PERKS…).

/**
 * Un producto es "coloreable" si su obra es un paint-by-numbers: eso habilita
 * los accesorios de pintura y la alternativa impresa.
 *
 * Cuando el backend no manda `artKind` solo Digital y Poster se asumen
 * coloreables, que es lo que renderizaban antes de unificar los templates.
 * Canvas mantiene el gate estricto que ya tenía, y un template desconocido
 * (producto sin `template` en el backend, que cae al fallback del router)
 * también: sin saber qué es, no se le ofrecen bloques de pintura.
 */
export function isPaintableProduct(
  template: string,
  artKind?: string | null,
): boolean {
  if (artKind) return artKind === "pbn";
  return template === "Digital" || template === "Poster";
}

/**
 * Pasos del "how to use" según formato de entrega y contenido. El coloreable
 * suma el paso de pintar; la descarga digital lo cierra con el PDF imprimible
 * en vez del envío.
 */
export function getProcessSteps(
  template: string,
  isPaintable: boolean,
): ProcessStep[] {
  if (template === "Digital") return DIGITAL_PROCESS_STEPS;
  return isPaintable ? PRODUCT_PBN_PROCESS_STEPS : PRODUCT_PROCESS_STEPS;
}
