// Helpers para las "opciones de template" de un estilo: tipos, ejemplos y
// validación. Extraído de page.tsx para mantener la página enfocada en la UI.

export const UNASSIGNED = "";

export type TemplateVarOption =
  | {
      type: "select";
      label: string;
      options: { value: string; label: string }[];
      default: string;
      required?: boolean;
    }
  | {
      type: "slider";
      label: string;
      min: number;
      max: number;
      step?: number;
      default: number;
    }
  | { type: "color"; label: string; default: string };

export const EXAMPLE_TEMPLATE_VARS = `{
  "colorCount": 5
  }`;

export const EXAMPLE_TEMPLATE_VAR_OPTIONS = `{
  "background": {
    "type": "select",
    "label": "Fondo",
    "options": [
      { "value": "white", "label": "Blanco" },
      { "value": "blue", "label": "Azul" }
    ],
    "default": "white",
    "required": true
  },
  "colorCount": {
    "type": "slider",
    "label": "Cantidad de colores",
    "min": 3,
    "max": 10,
    "step": 1,
    "default": 5
  },
  "accentColor": {
    "type": "color",
    "label": "Color de acento",
    "default": "#448da6"
  }
}`;

export function validateTemplateVarOptions(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    return "debe ser un objeto";
  }
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return `"${key}" debe ser un objeto`;
    }
    const opt = raw as Record<string, unknown>;
    if (opt.type === "select") {
      if (!Array.isArray(opt.options) || opt.options.length === 0) {
        return `"${key}.options" debe ser un array no vacío`;
      }
      const allowed = (opt.options as Array<Record<string, unknown>>).map(
        (o) => o.value,
      );
      if (!allowed.includes(opt.default)) {
        return `"${key}.default" no está en options`;
      }
    } else if (opt.type === "slider") {
      const {
        min,
        max,
        default: def,
      } = opt as {
        min: number;
        max: number;
        default: number;
      };
      if (typeof min !== "number" || typeof max !== "number") {
        return `"${key}.min" y "${key}.max" deben ser números`;
      }
      if (min >= max) return `"${key}.min" debe ser menor que "${key}.max"`;
      if (typeof def !== "number" || def < min || def > max) {
        return `"${key}.default" fuera del rango [${min}, ${max}]`;
      }
    } else if (opt.type === "color") {
      if (
        typeof opt.default !== "string" ||
        !/^#[0-9a-fA-F]{6}$/.test(opt.default)
      ) {
        return `"${key}.default" debe ser un hex válido (#RRGGBB)`;
      }
    } else {
      return `"${key}.type" debe ser "select", "slider" o "color"`;
    }
    if (typeof opt.label !== "string" || !opt.label.trim()) {
      return `"${key}.label" es requerido`;
    }
  }
  return null;
}
