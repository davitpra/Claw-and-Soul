---
name: clawandsoul-design-system
description: Sistema de diseño de Claw & Soul — cubre DOS contextos: (1) Storefront (todo fuera de /admin): paleta teal/cream (#448da6 / #f0eee9), Tailwind, rounded-xl, Material Symbols, Epilogue+Lato. (2) Admin (src/app/admin/**): @shopify/polaris v13 + @shopify/polaris-icons, sin Tailwind para layout interno, acento teal ya configurado vía polaris-overrides.css. Usa esta skill siempre que el usuario pida crear, agregar, modificar o revisar cualquier UI en este repo: páginas, secciones, componentes, botones, cards, formularios, modales, headers, footers, panel admin. También úsala al refactorizar o validar consistencia visual aunque el usuario no mencione "design system" explícitamente.
---

# Claw & Soul — Design System

> **Esta skill cubre dos sistemas distintos.** Si estás editando archivos en `src/app/admin/**` → ir a la sección [Admin pages — Shopify Polaris](#admin-pages--shopify-polaris). Para cualquier otro archivo (storefront, shared, widgets no-admin) → las reglas de abajo aplican.

Guía de referencia rápida para construir UI consistente en este repo. La fuente de verdad técnica es `src/app/globals.css` (tokens `@theme`) y los componentes existentes.

## Principios de diseño

- **Estética warm & artesanal** — fondos cream (`#f0eee9`) en secciones, no blanco puro como fondo de página.
- **Brand teal para CTAs** — `bg-primary` (`#448da6`) es el único color de acción primaria; `hover:bg-primary-dark` para estados hover.
- **Esquinas suaves por defecto** — `rounded-xl` (16px) en botones, inputs, modales, chips e imágenes sueltas; `rounded-full` solo para avatares/badges circulares. **Nunca usar `rounded-2xl`.** **Excepción: cards de imagen** — el componente `<Card>` (`shared/ui/Card`) es plano (`overflow-hidden`, sin `rounded`), igual que el diseño de `CollectionSection`.
- **Sombras sutiles** — `shadow-sm` en reposo → `shadow-md` en hover; `shadow-lg shadow-primary/20` solo en el CTA principal por página.
- **Transiciones consistentes** — `transition-all` es el default; `duration-300` implícito en Tailwind; usar `hover:scale-105` en CTAs primarios.
- **Mobile-first** — todas las clases base son móvil; breakpoints `sm:`, `md:`, `lg:`, `xl:` para escalar.
- **Iconografía Material Symbols** — `<span className="material-symbols-outlined text-[20px]">icon_name</span>`. No mezclar con Lucide salvo que ya exista en el componente.
- **Sin `cn()` ni `clsx`** — composición de clases con template literals y ternarios. No introducir helpers externos.

## Qué hacer / qué evitar

| Hacer | Evitar |
|-------|--------|
| `bg-primary`, `text-text-main`, `bg-cream` | Colores hex hardcodeados fuera de `globals.css` |
| `rounded-xl` en botones, inputs, modales, chips e imágenes sueltas | `rounded-2xl`, `rounded-lg` o `rounded-md` para elementos interactivos |
| `<Card>` plana (sin `rounded`) para cards de imagen | `rounded-xl` en el componente `<Card>` |
| `border border-[#E0DED9]` en bordes sutiles | Otros grises inventados para bordes |
| Epilogue para headings (`font-display`) | Fuentes distintas a Epilogue/Lato |
| `shadow-sm` → `hover:shadow-md` | Sombras muy dramáticas en elementos secundarios |
| `transition-all` | `transition-none` o transiciones solo en una propiedad salvo necesidad |
| Opacidades con `/` modificador: `text-slate-dark/80`, `bg-primary/10` | `opacity-` separado para colores de marca |
| **En `/admin`**: `<Badge tone="success">` de Polaris | Badges custom con clases Tailwind dentro de `/admin` |
| **En `/admin`**: `<Button variant="plain">` de Polaris | `<button className="bg-primary…">` dentro de `/admin` |
| **En `/admin`**: iconos de `@shopify/polaris-icons` | `material-symbols-outlined` dentro de `/admin` |

## Admin pages — Shopify Polaris

Aplica **solo** a archivos en `src/app/admin/**`. Para storefront, ignorar esta sección.

- Importa componentes de `@shopify/polaris` e iconos de `@shopify/polaris-icons`. No usar Tailwind para layout interno dentro de componentes Polaris.
- El `<AppProvider i18n={esTranslations}>` ya está configurado en `src/app/admin/PolarisProvider.tsx` y envuelve todo el layout (`src/app/admin/layout.tsx`). No añadir otro provider.
- El override teal `#448da6` está en `src/app/admin/polaris-overrides.css` — no hardcodear el hex en JSX; los botones primary lo heredan automáticamente.

**Mapeo de UI → componente Polaris:**

| Elemento | Componente Polaris |
|---|---|
| Header de página con acciones | `<Page title subtitle primaryAction titleMetadata>` |
| Card contenedor | `<Card>` / `<Card padding="0">` |
| Tabla de datos | `<IndexTable resourceName itemCount headings selectable={false}>` |
| Fila de tabla | `<IndexTable.Row id position>` + `<IndexTable.Cell>` |
| Badge de estado | `<Badge tone="success|warning|critical|info|enabled">` |
| Botón inline | `<Button variant="plain" size="slim">` |
| Imagen en tabla | `<Thumbnail source alt size="small|extraSmall">` |
| Layout 2 columnas | `<Layout><Layout.Section variant="oneThird">` |
| Filtros + buscador | `<Filters queryValue filters appliedFilters>` + `<ChoiceList>` |
| Paginación | `<Pagination hasPrevious hasNext onPrevious onNext>` |
| Tabs con paneles | `<Tabs tabs selected onChange>` + array `panels` |
| Campo de texto | `<TextField label value onChange autoComplete="off">` (recibe `string`, no event) |
| Stack horizontal | `<InlineStack gap align blockAlign>` |
| Stack vertical | `<BlockStack gap inlineAlign>` |
| Box espaciado | `<Box padding borderColor borderBlockEndWidth>` |
| Spinner de carga | `<Spinner size="small">` |
| Banner de error | `<Banner tone="critical" onDismiss>` |

Ver patrones detallados y snippets reales: `references/admin-polaris.md`.

---

## Referencias detalladas

Lee solo lo que necesites para la tarea:

| Tema | Archivo |
|------|---------|
| Colores, radius, sombras, espaciado | `references/tokens.md` |
| Tipografía, escala, pesos | `references/typography.md` |
| Snippets de componentes (Button, Input, Card, Icon, Link) | `references/components.md` |
| FSD, naming, composición de clases | `references/conventions.md` |
| Componentes Polaris en `/admin` | `references/admin-polaris.md` |

## Checklist de revisión (para validar UI existente)

**Para archivos de storefront (fuera de `/admin`):**
- [ ] ¿Todos los colores usan clases Tailwind de los tokens (`bg-primary`, `text-text-muted`, etc.) y no hex hardcodeados?
- [ ] ¿Los radios son `rounded-xl` en botones, inputs, modales y chips? No debe haber `rounded-2xl` ni `rounded-md`. Las cards de imagen usan `<Card>` plano (sin `rounded`).
- [ ] ¿Los bordes sutiles usan `border-[#E0DED9]`?
- [ ] ¿Los hover en buttons tienen `hover:bg-primary-dark` (o `hover:bg-gray-50` en secundarios)?
- [ ] ¿Las sombras escalan de `shadow-sm` a `shadow-md` en hover?
- [ ] ¿Los iconos son Material Symbols con `text-[N]px` para tamaño?
- [ ] ¿La tipografía de headings usa `font-display` (Epilogue) y body usa `font-body` (Lato)?

**Para archivos en `src/app/admin/**`:**
- [ ] ¿La página usa `<Page title>` como root (no un `<div>` o `<section>` custom)?
- [ ] ¿Los componentes se importan de `@shopify/polaris` y los iconos de `@shopify/polaris-icons`?
- [ ] ¿No hay clases Tailwind de layout (`flex`, `grid`, `rounded-xl`, `bg-cream`, etc.) mezcladas dentro de componentes Polaris?
- [ ] ¿Los headings de `<IndexTable>` se pasan inline como `headings={[{title: "X"}, …]}` (no como variable tipada)?
- [ ] ¿Los badges usan `<Badge tone="…">` en vez de spans con clases custom?
- [ ] ¿No hay `material-symbols-outlined` (usar `@shopify/polaris-icons` en su lugar)?
- [ ] ¿No se hardcodea `#448da6` en JSX (el override ya aplica vía `polaris-overrides.css`)?
