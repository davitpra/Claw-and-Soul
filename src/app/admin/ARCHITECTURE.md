# Arquitectura del panel admin

Convención para crear y modificar carpetas dentro de `src/app/admin/`. Léela antes
de añadir una nueva sección o tocar una existente. Describe el patrón que ya usa el
admin y fija las reglas que evitan que vuelva a derivar hacia páginas gigantes e
inconsistentes.

> El admin difiere a propósito del resto del storefront: usa **Shopify Polaris v13**
> (no Tailwind para el layout interno) y **co-localiza** los componentes junto a su
> ruta en vez de centralizarlos en `src/widgets/`. Ambas cosas son intencionales.

---

## 1. Principios

- **`page.tsx` = orquestadora fina.** Arma el `<Page>` de Polaris, dispara el fetch
  inicial y compone las cards/secciones. La lógica async no trivial vive en un hook
  co-localizado, no inline en la página.
- **Co-localización por ruta.** Un componente que solo usa una ruta vive junto a su
  `page.tsx`. Solo lo reutilizado entre ≥2 rutas sube de nivel.
- **Polaris para el layout interno.** Acento teal (`#448da6`) ya configurado vía
  `polaris-overrides.css`. Sigue la skill `clawandsoul-design-system`.
- **Presentación de estado centralizada.** Ningún componente define mapeos
  `status → label/tone` inline; se importan de `entities/admin/lib/*`.

---

## 2. Estructura estándar de una ruta

Esqueleto canónico, modelado sobre `admin/products/[id]/` (el mejor ejemplo actual):

```
admin/<recurso>/
├── page.tsx                  Lista (IndexTable + Filters). Fina.
└── [id]/
    ├── page.tsx              Detalle. Orquesta cards + usa el hook.
    ├── use<Recurso>Detail.ts Hook con TODA la lógica async/estado de la ruta.
    └── _components/          Cards, modales y helpers privados de la ruta.
        ├── <Algo>Card.tsx    Secciones de la página (una responsabilidad c/u).
        ├── <Algo>Modal.tsx   Modales de la ruta.
        └── <algo>.ts         Helpers/constantes puros de la ruta.
```

Los componentes y helpers que solo usa una ruta van en su `_components/`. El hook
`use<Recurso>Detail.ts` se queda a la vista junto a `page.tsx`.

**Patrón a imitar:**

- Detalle con hook: `admin/products/[id]/page.tsx` + `useProductDetail.ts` +
  `_components/ProductDetailsSidebar.tsx` / `_components/LinkedVariantsCard.tsx`.
- Detalle con muchas cards y modales co-localizados: `admin/orders/[id]/_components/`.
- Componente grande partido en sub-piezas + helper puro:
  `_components/PrintStudioModal.tsx` → `PrintStudioStage.tsx` +
  `PrintStudioControls.tsx` + `printStudio.ts`.

---

## 3. Reglas de tamaño y descomposición

Estas reglas existen para que no se repitan los archivos gigantes que ya tenemos.

- **Hook obligatorio.** Si una ruta tiene más de una llamada async o estado no
  trivial, extrae la lógica a `use<Recurso>Detail.ts` co-localizado (como
  `useProductDetail.ts`). No dejes `useEffect`/`fetch` inline en `page.tsx`.
- **Umbral de partición.** Un componente que supera ~300–400 líneas se parte en
  sub-cards co-localizadas (y, si tiene cálculo puro, un helper `.ts`).
- **Una responsabilidad por componente** (una card, un modal, un control).

---

## 4. Cuándo co-localizar vs. subir a `entities/admin`

| Qué | Dónde |
|-----|-------|
| Componente/helper usado por 1 sola ruta | `<ruta>/_components/` |
| Componente usado por ≥2 rutas admin o por el `layout` | `admin/_components/` (ej. `ImagePreviewModal.tsx`, `AdminSidebar.tsx`) |
| Llamada a API / tipos | `entities/admin/api.ts` (siempre, ya centralizado) |
| Mapeo estado→label/tone, transiciones, filtros, formato | `entities/admin/lib/*` (ej. `production-status.ts`, `order-transitions.ts`, `order-format.ts`) |
| Hook async específico de una ruta | Co-localizado (`use<X>Detail.ts`) |
| Hook reutilizado entre rutas | `src/hooks/` (ej. `useAdminGenerationStatus.ts`) |

---

## 5. Convenciones de naming

- **Carpetas de ruta:** convención Next (`page.tsx`, `[id]`, `new/`). Carpetas
  privadas no enrutables: prefijo `_` (`_components/`).
- **Componentes:** `PascalCase.tsx`.
- **Hooks:** `useXxx.ts`.
- **Libs de dominio** (en `entities/admin/lib/`): `kebab-case.ts`.
- **Idioma:** comentarios en español, identificadores en inglés.

---

## 6. Auth y data flow

**Triple guard de acceso** (cualquiera basta para bloquear, pero coexisten):

1. `src/proxy.ts` — servidor. Decodifica el JWT de la cookie httpOnly y exige
   `role === 'admin'` para `/admin/*`; si no, redirige. (Next 16 renombró
   `middleware.ts` → `proxy.ts` y `middleware()` → `proxy()`.)
2. `admin/layout.tsx` — cliente. Usa `useAuth().isAdmin`; muestra spinner mientras
   carga y redirige si no es admin. Envuelve en `PolarisProvider` + `AdminSidebar`.
3. `AuthContext` — `isAdmin = user?.role === 'admin'`, con el `role` de `GET /users/me`.

**Datos:** todo pasa por `adminApi` en `entities/admin/api.ts`. `adminFetch`
desempaqueta el envelope `{ success, data, timestamp }` con `data?.data ?? data` y
usa `credentials: 'include'`. Las páginas **no** llaman a `fetch` directo, salvo el
`shopifyFetch` best-effort para traer miniaturas en vivo desde el Storefront (no
bloquea la UI si falla).

---

## 7. Sidebar y descubribilidad

Toda ruta de nivel superior se registra en
`src/app/admin/_components/AdminSidebar.tsx`.

**Excepción intencional:** `vision-configs` e `image-gen-configs` no están en el
sidebar — se navega a ellas desde el editor de estilos (`styles/[id]`). Es una
decisión de UX, no un olvido.

---

## 8. Checklist: añadir una nueva sección admin

1. Crea `admin/<recurso>/page.tsx` (lista) fina con `<Page>` + `IndexTable`/`Filters`.
2. Añade los endpoints y tipos del recurso a `adminApi` en `entities/admin/api.ts`.
3. Extrae cualquier mapeo de presentación (estado→label/tone, formato) a
   `entities/admin/lib/`.
4. Co-localiza cards y modales en `<ruta>/_components/`.
5. Si hay lógica async/estado no trivial, créa `use<Recurso>Detail.ts` co-localizado.
6. Registra la ruta en `AdminSidebar.tsx` (salvo excepción justificada de UX).
7. Usa componentes Polaris y el tono teal del tema.
