# Convenciones — Claw & Soul

## Arquitectura FSD (Feature-Sliced Design)

```
src/
├── app/           → Next.js App Router (páginas, layouts, API routes)
├── components/    → Componentes globales de layout (Navbar, Footer, secciones home)
├── shared/ui/     → Primitivos UI reutilizables (Breadcrumbs)
├── features/      → Lógica de feature específica (personalize)
├── widgets/       → Widgets compuestos complejos (product-details, ia-generator, product-faq)
├── entities/      → Modelos de dominio con UI (product, art-style, pet-product)
├── hooks/         → Custom React hooks
├── context/       → React Context providers (AuthContext, CartContext)
└── lib/           → Utilidades y clientes (Shopify GraphQL, auth)
```

**Regla de dependencias FSD**: las capas superiores pueden importar de capas inferiores, pero no al revés.
`app` > `widgets` > `features` > `entities` > `shared`

---

## Path Alias

`@/*` mapea a `./src/*` (configurado en `tsconfig.json`).

```ts
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
```

### Admin imports

En archivos de `src/app/admin/**` se usan además `@shopify/polaris` y `@shopify/polaris-icons`:

```tsx
import { Page, Card, IndexTable, Badge, Button, Text, InlineStack, BlockStack } from "@shopify/polaris";
import { RefreshIcon, TeamIcon, OrderIcon } from "@shopify/polaris-icons";
```

No importar Material Symbols ni usar clases Tailwind de la storefront (cream, rounded-xl, etc.) dentro de archivos admin.

---

## Composición de clases Tailwind

**No existe `cn()` ni `clsx` en este repo.** La composición se hace con template literals y ternarios nativos.

```tsx
// Correcto — template literal con ternario
className={`text-sm font-medium transition-all ${
  isActive ? "text-primary" : "text-text-main hover:text-primary"
}`}

// Correcto — clases concatenadas para condición simple
className={`rounded-xl px-4 py-2 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"}`}

// Incorrecto — no introducir cn() o clsx sin que el usuario lo pida
import { cn } from "@/lib/utils";   // ← Este archivo no existe
```

---

## Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `ProductCard.tsx`, `IAHeader.tsx` |
| Hooks | camelCase con prefijo `use` | `useCart.ts`, `useAuthFetch.ts` |
| Carpetas de feature/widget | kebab-case | `ia-generator/`, `product-details/` |
| Carpetas de entidad | kebab-case | `pet-product/`, `art-style/` |
| Variables/funciones | camelCase | `cartCount`, `addToCart` |
| Contextos | PascalCase con sufijo `Context` | `CartContext`, `AuthContext` |

---

## Responsive — Mobile-first

Todos los estilos base aplican al móvil. Escala con breakpoints Tailwind estándar:

| Breakpoint | Mínimo | Uso |
|---|---|---|
| *(base)* | 0px | Móvil |
| `sm:` | 640px | Tablet pequeña |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop ancho |

Patrones comunes:
```tsx
// Ocultar/mostrar según viewport
className="hidden lg:flex"    // visible solo en desktop
className="hidden sm:block"   // oculto en móvil
className="xl:hidden"         // oculto en pantallas muy anchas

// Grid adaptativo
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

// Tipografía escalable
className="text-4xl md:text-5xl lg:text-6xl"

// Padding adaptativo
className="px-4 sm:px-6 lg:px-8"
```

---

## Imágenes

`next/image` para imágenes de proyecto. Dominios remotos permitidos en `next.config.ts`:
- `cdn.shopify.com` — imágenes de productos Shopify
- `fal.media` — imágenes generadas por IA (FAL)

Imágenes de fondo decorativas se implementan como `div` con `bg-cover bg-center` + `style={{ backgroundImage }}` cuando se necesita overflow/scale sin los constraints de `next/image`.

---

## Estado y autenticación

```ts
// Verificar autenticación
import { useAuth } from "@/context/AuthContext";
const { isAuthenticated, isLoading } = useAuth();

// Fetch autenticado (recomendado — maneja auto-refresh del token)
import { useAuthFetch } from "@/hooks/useAuthFetch";
const { get, post } = useAuthFetch();

// Cart
import { useCart } from "@/hooks/useCart";
const { items, addToCart, removeItem, cartCount } = useCart();
```

---

## Shopify / Backend

- Llamadas client-side van a `/api/shopify/proxy` (nunca directo al Storefront API desde el browser).
- Server-side usa `src/lib/shopify/` directamente.
- Queries GraphQL en `src/lib/shopify/queries/`.
- Acciones de servidor en `src/lib/shopify/actions/`.

---

## Animaciones / Transiciones

Patrones estándar del repo:

```tsx
transition-all            // default para la mayoría
transition-colors         // cuando solo cambia color (más performante)
transition-transform      // cuando solo hay scale/rotate
duration-300              // velocidad estándar (implícita en transition-all)
duration-500              // para transiciones más lentas (imágenes hero)

hover:scale-105           // CTA buttons primarios
hover:scale-110           // imágenes dentro de cards (group-hover)
hover:rotate-0            // imagen hero que tiene rotate-2 en reposo
hover:gap-2               // links con icono de flecha (gap-1 → gap-2)
```

Animaciones de mount disponibles (Tailwind built-in):
```tsx
animate-in fade-in zoom-in
```

---

## Notas de producción

- `"use client"` necesario en componentes con hooks de estado/efecto o `usePathname`.
- Los Server Components (sin `"use client"`) pueden usar `async/await` para data fetching de Shopify directamente.
- El `<body>` tiene `antialiased` aplicado en `layout.tsx:38`.
- La página tiene `className="light"` en `<html>` — modo oscuro es opt-in, no automático.
