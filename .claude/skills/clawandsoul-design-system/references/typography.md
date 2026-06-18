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

> **Regla obligatoria:** Todo heading (`<h1>`–`<h6>`) lleva **siempre** `font-display font-black` (Epilogue 900). No uses `font-bold`/`font-semibold` en headings — la jerarquía se construye con el tamaño (`text-*`), nunca bajando el peso.

| Elemento | Clases observadas | Componente |
|---|---|---|
| H1 hero | `font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-dark` | `Hero.tsx:14` |
| H2 sección | `font-display text-3xl md:text-4xl font-black text-slate-dark` | `Reviews.tsx:28` |
| H2 footer | `font-display text-2xl font-black` | `Footer.tsx:10` |
| H3 card | `font-display text-lg font-black text-slate-dark` | `MyArtworks.tsx:17` |
| H4 footer nav | `font-display font-black text-lg` | `Footer.tsx:50` |
| Navbar brand | `font-display text-lg lg:text-2xl font-black tracking-[-0.015em] text-text-main` | `Navbar.tsx:86` |

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
| `font-black` (900) | **Todos los headings** (`<h1>`–`<h6>`) sin excepción → impacto máximo |
| `font-bold` (700) | Botones, labels fuertes, eyebrows (NO headings) |
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
