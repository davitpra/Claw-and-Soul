import { SelectOptionItem } from "@/entities/art-style/model/styles";

/**
 * Los `value` de un select de estilo son palabras que viajan al prompt de IA
 * ("cream", "sage green"), aunque algunos estilos ya guardan hex ("#1A3A2A").
 * Este mapa es solo cosmético: le da un color al punto del selector.
 *
 * Las entradas compuestas van primero porque el match exacto tiene prioridad;
 * así "light gray" no cae en el gris genérico ni "sage green" en el verde.
 */
const NAMED_COLORS: Record<string, string> = {
  "sage green": "#9CAF88",
  "teal blue": "#4B8FA6",
  "navy blue": "#1E3A8A",
  "blush pink": "#E8B4B8",
  "hot pink": "#FF69B4",
  "light gray": "#D1D5DB",
  "dark gray": "#4B5563",
  "lime green": "#84CC16",
  "forest green": "#228B22",
  "mint green": "#98E4C4",
  "sky blue": "#7DD3FC",

  white: "#FFFFFF",
  ivory: "#FDFBF5",
  cream: "#F0EEE9",
  beige: "#E8DCC8",
  tan: "#D2B48C",
  brown: "#8B5E3C",
  charcoal: "#36454F",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  black: "#111827",

  red: "#EF4444",
  crimson: "#DC143C",
  maroon: "#7F1D1D",
  wine: "#5C1A1A",
  coral: "#FF7F50",
  pink: "#F472B6",
  blush: "#E8B4B8",
  peach: "#FFDAB9",
  orange: "#F97316",
  amber: "#F59E0B",
  yellow: "#FACC15",
  gold: "#D4AF37",
  mustard: "#D4A017",

  lime: "#84CC16",
  sage: "#9CAF88",
  mint: "#98E4C4",
  forest: "#228B22",
  olive: "#6B8E23",
  green: "#22C55E",
  teal: "#448DA6",
  cyan: "#22D3EE",
  sky: "#7DD3FC",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  indigo: "#4F46E5",
  violet: "#8B5CF6",
  purple: "#8B5CF6",
  lavender: "#C4B5FD",
  magenta: "#D946EF",
  sepia: "#3D2817",
};

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Traduce el valor de una opción a un color CSS, o `null` si no describe uno
 * ("pastel gradient", "high-contrast"). Los valores compuestos se resuelven
 * palabra por palabra cuando no hay match exacto: "deep forest" -> forest.
 */
export function getOptionColor(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (HEX_PATTERN.test(normalized)) return normalized;
  if (NAMED_COLORS[normalized]) return NAMED_COLORS[normalized];

  for (const word of normalized.split(/[\s_-]+/)) {
    if (NAMED_COLORS[word]) return NAMED_COLORS[word];
  }

  return null;
}

/**
 * Un select se considera de colores cuando todas sus opciones se resuelven a un
 * color. Es lo que decide si se renderiza el desplegable con puntitos o los
 * chips de texto, en vez de depender del nombre de la key (que varía por
 * estilo: `background`, `backgroundColor`, `lineColor`...).
 */
export function isColorOptionList(options: SelectOptionItem[]): boolean {
  return (
    options.length > 1 && options.every((o) => getOptionColor(o.value) !== null)
  );
}
