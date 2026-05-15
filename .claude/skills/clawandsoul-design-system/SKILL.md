---
name: clawandsoul-design-system
description: Sistema de diseño de Claw & Soul — paleta teal/cream (#448da6 / #f0eee9), tipografía Epilogue+Lato, esquinas rounded-xl, iconos Material Symbols. Usa esta skill siempre que el usuario pida crear, agregar, modificar o revisar cualquier UI en este repo: páginas, secciones, componentes, botones, cards, formularios, modales, headers, footers. También úsala al refactorizar o validar consistencia visual aunque el usuario no mencione "design system" explícitamente.
---

# Claw & Soul — Design System

Guía de referencia rápida para construir UI consistente en este repo. La fuente de verdad técnica es `src/app/globals.css` (tokens `@theme`) y los componentes existentes.

## Principios de diseño

- **Estética warm & artesanal** — fondos cream (`#f0eee9`) en secciones, no blanco puro como fondo de página.
- **Brand teal para CTAs** — `bg-primary` (`#448da6`) es el único color de acción primaria; `hover:bg-primary-dark` para estados hover.
- **Esquinas suaves por defecto** — `rounded-xl` (16px) en todo: botones, inputs, cards, imágenes, modales, chips; `rounded-full` solo para avatares/badges circulares. **Nunca usar `rounded-2xl`.**
- **Sombras sutiles** — `shadow-sm` en reposo → `shadow-md` en hover; `shadow-lg shadow-primary/20` solo en el CTA principal por página.
- **Transiciones consistentes** — `transition-all` es el default; `duration-300` implícito en Tailwind; usar `hover:scale-105` en CTAs primarios.
- **Mobile-first** — todas las clases base son móvil; breakpoints `sm:`, `md:`, `lg:`, `xl:` para escalar.
- **Iconografía Material Symbols** — `<span className="material-symbols-outlined text-[20px]">icon_name</span>`. No mezclar con Lucide salvo que ya exista en el componente.
- **Sin `cn()` ni `clsx`** — composición de clases con template literals y ternarios. No introducir helpers externos.

## Qué hacer / qué evitar

| Hacer | Evitar |
|-------|--------|
| `bg-primary`, `text-text-main`, `bg-cream` | Colores hex hardcodeados fuera de `globals.css` |
| `rounded-xl` como radio base en todo (cards, imágenes, botones, inputs) | `rounded-2xl`, `rounded-lg` o `rounded-md` para elementos interactivos |
| `border border-[#E0DED9]` en bordes sutiles | Otros grises inventados para bordes |
| Epilogue para headings (`font-display`) | Fuentes distintas a Epilogue/Lato |
| `shadow-sm` → `hover:shadow-md` | Sombras muy dramáticas en elementos secundarios |
| `transition-all` | `transition-none` o transiciones solo en una propiedad salvo necesidad |
| Opacidades con `/` modificador: `text-slate-dark/80`, `bg-primary/10` | `opacity-` separado para colores de marca |

## Referencias detalladas

Lee solo lo que necesites para la tarea:

| Tema | Archivo |
|------|---------|
| Colores, radius, sombras, espaciado | `references/tokens.md` |
| Tipografía, escala, pesos | `references/typography.md` |
| Snippets de componentes (Button, Input, Card, Icon, Link) | `references/components.md` |
| FSD, naming, composición de clases | `references/conventions.md` |

## Checklist de revisión (para validar UI existente)

- [ ] ¿Todos los colores usan clases Tailwind de los tokens (`bg-primary`, `text-text-muted`, etc.) y no hex hardcodeados?
- [ ] ¿Los radios son `rounded-xl` en todo (cards, imágenes, botones, inputs)? No debe haber `rounded-2xl` ni `rounded-md`.
- [ ] ¿Los bordes sutiles usan `border-[#E0DED9]`?
- [ ] ¿Los hover en buttons tienen `hover:bg-primary-dark` (o `hover:bg-gray-50` en secundarios)?
- [ ] ¿Las sombras escalan de `shadow-sm` a `shadow-md` en hover?
- [ ] ¿Los iconos son Material Symbols con `text-[N]px` para tamaño?
- [ ] ¿La tipografía de headings usa `font-display` (Epilogue) y body usa `font-body` (Lato)?
