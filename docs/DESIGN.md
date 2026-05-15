# Claw & Soul — Design System

Guía de diseño para el equipo. La fuente de verdad técnica es `src/app/globals.css`.

---

## Paleta de colores

| Nombre         | Hex       | Uso                                                    |
| -------------- | --------- | ------------------------------------------------------ |
| Primary        | `#448da6` | CTAs, links activos, acentos de marca                  |
| Primary Dark   | `#367a8f` | Hover sobre Primary                                    |
| Cream          | `#f0eee9` | Fondo de la mayoría de secciones                       |
| Slate Dark     | `#103642` | Fondo footer, headings principales, texto principal    |
| Text Muted     | `#5c747c` | Texto secundario, placeholders                         |
| FAQ Background | `#eae7e1` | Solo acordeón FAQ                                      |
| Border sutil   | `#E0DED9` | Bordes de inputs, navbar scrolled, botones secundarios |

### Convención de opacidades

Se usan los modificadores de opacidad de Tailwind (`/`) para variantes:

- `text-slate-dark/80` — texto principal suavizado
- `text-slate-dark/60` — texto descriptivo
- `bg-primary/10` — badge/tag con color brand
- `text-white/70` — texto sobre fondo oscuro

---

## Tipografía

### Fuentes

| Fuente                        | Rol             | Clase CSS                   | Pesos              |
| ----------------------------- | --------------- | --------------------------- | ------------------ |
| **Epilogue**                  | Headings, brand | `font-display`              | 400, 500, 700, 900 |
| **Lato**                      | Cuerpo, UI      | `font-body`                 | 300, 400, 700, 900 |
| **Material Symbols Outlined** | Iconos          | `material-symbols-outlined` | Variable           |

### Jerarquía

| Elemento     | Tamaño                             | Peso                            | Fuente        |
| ------------ | ---------------------------------- | ------------------------------- | ------------- |
| H1 hero      | `text-4xl` → `text-6xl`            | `font-black` (900)              | Epilogue      |
| H2 sección   | `text-3xl` → `text-4xl`            | `font-black` (900)              | Epilogue      |
| H3 card      | `text-lg`                          | `font-bold` (700)               | Epilogue/Lato |
| Párrafo lead | `text-lg leading-relaxed`          | `font-normal` (400)             | Lato          |
| Body regular | `text-base`                        | `font-normal` (400)             | Lato          |
| Label / UI   | `text-sm`                          | `font-medium` o `font-semibold` | Lato          |
| Caption      | `text-xs`                          | `font-medium`                   | Lato          |
| Eyebrow      | `text-sm uppercase tracking-wider` | `font-bold`                     | Lato          |

---

## Espaciado y layout

- **Max-width de página**: `max-w-[1280px] mx-auto` con `px-6 lg:px-10`
- **Padding de sección**: `py-20` estándar, `py-16` compacto, `py-12` mínimo
- **Sistema de base**: 4px (escala Tailwind estándar)

---

## Componentes base

### Botones

**Primario**: fondo teal, texto blanco, hover scale + dark.

```
bg-primary → hover:bg-primary-dark, rounded-xl, shadow-sm → hover:shadow-md
CTA hero: shadow-lg shadow-primary/20, hover:scale-105
```

**Secundario**: fondo blanco, borde `#E0DED9`, hover gray-50.

```
bg-white border border-[#E0DED9] → hover:bg-gray-50, rounded-xl
```

**Sobre oscuro**: igual que primario pero sin necesidad de shadow.

### Inputs

```
rounded-xl, border border-[#E0DED9], focus:ring-2 focus:ring-primary/30
Sobre oscuro: bg-white/10 border border-white/20
```

### Cards de producto

```
bg-white shadow-sm → hover:shadow-md
Imagen: overflow-hidden + group-hover:scale-110 duration-500
```

---

## Border Radius

| Radio          | Uso                                                 |
| -------------- | --------------------------------------------------- | --- |
| `rounded-xl`   | Default — botones, inputs, chips, tooltips, modales |     |
| `rounded-full` | Avatares, badges circulares                         |

---

## Iconografía

**Material Symbols Outlined** es la librería principal.

```html
<span class="material-symbols-outlined text-[20px]">icon_name</span>
```

Tamaños: 16px (inline pequeño), 18px (con texto), 20px (estándar UI), 24px (standalone).

**Lucide React** está instalado como dependencia secundaria.

---

## Estructura de diseño (FSD)

```
Páginas → Widgets → Features → Entities → Shared UI
```

- Las secciones de home son `components/home/` (no son widgets full-feature).
- Los flujos complejos (carrito, generador IA) están en `widgets/`.

---

## Principios

1. **Warm & artesanal** — cream como fondo base, no blanco puro.
2. **Un solo color de acción** — solo `#448da6` para CTAs; no introducir colores secundarios de acción sin diseño previo.
3. **Transiciones siempre** — `transition-all` en todos los elementos interactivos; nunca elementos estáticos que "saltan".
4. **Mobile-first** — diseñar para 375px y escalar hacia arriba.
5. **Contraste accesible** — el slate dark `#103642` sobre cream `#f0eee9` cumple WCAG AA.
