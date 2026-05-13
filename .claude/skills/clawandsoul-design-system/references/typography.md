# Tipografía — Claw & Soul

## Fuentes

Cargadas en `src/app/layout.tsx:7-17` vía `next/font/google`.

| Variable CSS | Fuente | Pesos | Clase Tailwind | Rol |
|---|---|---|---|---|
| `--font-epilogue` → `--font-display` | Epilogue | 400, 500, 700, 900 | `font-display` | Headings, títulos, brandname |
| `--font-lato` → `--font-body` | Lato | 300, 400, 700, 900 | `font-body` | Cuerpo de texto, párrafos, UI |

**Material Symbols Outlined** cargado via Google Fonts CDN en `src/app/layout.tsx:33-35`. Solo iconos outline; no usar otras variantes (Rounded, Sharp, etc.).

El `<body>` aplica `font-body` como base (`src/app/layout.tsx:38`). Los headings **no heredan** `font-body`; deben declarar `font-display` explícitamente o usar las clases de heading del sistema.

---

## Escala tipográfica (patrones observados en componentes)

### Headings

| Elemento | Clases observadas | Componente |
|---|---|---|
| H1 hero | `text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight font-display text-slate-dark` | `Hero.tsx:13` |
| H2 sección | `text-3xl md:text-4xl font-black text-slate-dark` | `FeaturedProducts.tsx:17` |
| H2 footer | `text-2xl font-bold` | `Footer.tsx:9` |
| H3 card | `text-lg font-bold text-slate-dark` | `FeaturedProducts.tsx:54` |
| H4 footer nav | `font-bold text-lg` | `Footer.tsx:50` |
| Navbar brand | `text-lg lg:text-xl font-bold tracking-[-0.015em] text-text-main` | `Navbar.tsx:74` |

### Body / párrafos

| Uso | Clases |
|---|---|
| Lead / descripción hero | `text-lg font-normal leading-relaxed text-slate-dark/80` |
| Descripción sección | `text-slate-dark/70` (base = text-base 16px) |
| Texto de card | `text-sm text-slate-dark/60 line-clamp-2` |
| Texto newsletter | `text-white/70` |

### Labels / UI pequeño

| Uso | Clases |
|---|---|
| Eyebrow / badge | `text-sm font-bold tracking-wider uppercase text-primary` |
| Nav links | `text-sm font-medium` |
| Botón estándar | `text-sm font-medium` o `text-sm font-semibold` |
| Botón CTA grande | `text-base font-bold` |
| Caption / meta | `text-xs font-medium text-slate-dark/70` |
| Micro texto | `text-xs text-slate-dark/60` |

---

## Patrones de peso

| Peso | Uso |
|---|---|
| `font-black` (900) | H1 hero, H2 sección → impacto máximo |
| `font-bold` (700) | H3, botones, labels fuertes |
| `font-semibold` (600) | Nav links activos, botones secundarios fuertes |
| `font-medium` (500) | Nav links, labels regulares |
| `font-normal` (400) | Párrafos, descripciones |
| `font-light` (300) | Raramente; texto muy de soporte |

---

## Leading y tracking

- Headings grandes: `leading-[1.1] tracking-tight`
- Headings medios: leading normal (implícito)
- Párrafos: `leading-relaxed`
- Brand nav: `tracking-[-0.015em]` (ligeramente condensado)
- Eyebrow: `tracking-wider` + `uppercase`

---

## Iconos Material Symbols

```tsx
<span className="material-symbols-outlined text-[20px]">icon_name</span>
```

Tamaños en uso: `text-[16px]` (estrellas), `text-[18px]` (inline con texto), `text-[20px]` (estándar UI), `text-[22px]` (prominente), `text-[24px]` (grande standalone).

Los iconos **no** usan la fuente `font-display` ni `font-body` — la fuente de iconos se aplica automáticamente por la clase `material-symbols-outlined`.
