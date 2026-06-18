# Tokens — Claw & Soul

Fuente de verdad: `src/app/globals.css` (bloque `@theme`, líneas 3-17).

## Colores de marca

| Token CSS | Valor | Clase Tailwind | Uso |
|-----------|-------|----------------|-----|
| `--color-primary` | `#448da6` | `bg-primary`, `text-primary`, `border-primary` | CTA primario, links activos, acentos |
| `--color-primary-dark` | `#367a8f` | `bg-primary-dark`, `hover:bg-primary-dark` | Estado hover de primario |
| `--color-primary-accent` | `#448da6` | *(alias de primary)* | — |
| `--color-background-light` | `#f0eee9` | `bg-background-light` | Fondo página (modo claro) |
| `--color-background-dark` | `#103642` | `bg-background-dark` | Fondo página (modo oscuro) |
| `--color-text-main` | `#103642` | `text-text-main` | Texto principal, headings |
| `--color-text-muted` | `#5c747c` | `text-text-muted` | Texto secundario, placeholders |
| `--color-slate-dark` | `#103642` | `text-slate-dark`, `bg-slate-dark` | Dark sections (Footer), headings en secciones |
| `--color-cream` | `#f0eee9` | `bg-cream` | Secciones alternadas (Hero, Featured, Shop) |
| `--color-faq-bg` | `#eae7e1` | `bg-faq-bg` | Solo acordeón FAQ, no usar en otro sitio |

### Variables CSS raíz (`:root`)
```css
--background: #f0eee9;   /* bg-background */
--foreground: #103642;   /* text-foreground */
```

### Opacidades frecuentes (modificador `/`)
```
text-slate-dark/80   → texto principal levemente transparente
text-slate-dark/70   → texto secundario
text-slate-dark/60   → texto descriptivo
text-white/70        → texto sobre fondo oscuro
text-white/50        → placeholder sobre fondo oscuro
bg-primary/10        → fondo de badge/tag con color brand
bg-primary/20        → anillo focus-visible
bg-white/95          → navbar semi-transparente
bg-white/10          → input sobre fondo oscuro (Footer)
bg-white/50          → input en barra de búsqueda
```

### Color hardcodeado documentado
`border-[#E0DED9]` — gris muy claro para bordes sutiles de inputs, navbar scrolled, botones secundarios, divisores y popovers flotantes. Es intencional; no sustituir con gray-200 porque el tono es warm (ligeramente beige). **No usar como borde de cards/paneles** — esos contenedores van planos: definidos solo con `bg-white`/`bg-cream` + `rounded-xl` sobre el fondo cream de la página, sin borde ni `shadow-sm`.

### Colores utilitarios (Tailwind estándar en uso)
- `bg-white`, `hover:bg-gray-50`, `bg-gray-200` — fondos neutros en componentes
- `text-yellow-500` — estrellas de rating
- `bg-green-100`, `text-green-600` — badge de confirmación
- `ring-primary/30` — anillo de focus en inputs

---

## Border Radius

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-xl` | 12px | **Default universal** — botones, inputs, modales, chips, tooltips, cards, imágenes, contenedores |
| `rounded-full` | 9999px | Avatares, badges circulares, logo circle |

> **Regla**: `rounded-2xl` está prohibido. Usar siempre `rounded-xl`.

---

## Sombras

| Clase | Uso |
|-------|-----|
| `shadow-sm` | Estado reposo en botones, cards, inputs |
| `hover:shadow-md` | Estado hover en casi todos los elementos interactivos |
| `shadow-lg shadow-primary/20` | Solo CTA principal de la página (Hero button) |
| `shadow-xl` | Floating cards (badge flotante en Hero) |
| `shadow-2xl` | Imagen hero grande |

---

## Espaciado (convenciones de uso en componentes)

Los valores son Tailwind estándar (escala 4px base). Los más usados:

| Uso | Clases |
|-----|--------|
| Padding interno botones | `px-8 py-4` (grande), `px-5 h-10` (estándar), `px-6 py-3` (mediano) |
| Padding de sección | `py-20`, `py-16`, `py-12` |
| Padding de contenedor | `px-6 lg:px-10` |
| Gap entre elementos | `gap-3`, `gap-4`, `gap-6`, `gap-8`, `gap-12` |
| Max-width de página | `max-w-[1280px] mx-auto` |
| Max-width navbar | `max-w-7xl mx-auto` |

---

## Scrollbar

Definido en `globals.css:31-44`. Thumb `#cbd5e1`, hover `#94a3b8`. No tocar salvo rediseño global.

---

## Polaris tokens en `/admin`

En `src/app/admin/**`, los tokens CSS nativos de Polaris (`--p-color-*`) están sobreescritos en `src/app/admin/polaris-overrides.css` para que el teal `#448da6` aparezca en botones primarios, links, badges activos, bordes e iconos de acción:

| Token Polaris | Valor override |
|---|---|
| `--p-color-bg-fill-brand` | `#448da6` |
| `--p-color-bg-fill-brand-hover` | `#367a8f` |
| `--p-color-text-link` | `#448da6` |
| `--p-color-border-brand` | `#448da6` |
| `--p-color-icon-brand` | `#448da6` |
| `--p-color-text-interactive` | `#448da6` |

No se necesita poner colores Tailwind ni clases `bg-primary` dentro del admin; Polaris los hereda del override automáticamente. Tampoco hardcodear `#448da6` en JSX de componentes Polaris.
