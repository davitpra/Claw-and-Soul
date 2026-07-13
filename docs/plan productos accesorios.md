# Línea de accesorios PBN (pinturas, pinceles, marcadores, paletas…)

## Contexto

Se añade una línea de productos complementarios genéricos: no se generan por IA, no tienen relación 1:1 con una obra, y se venden solos o junto a cualquier kit PBN. Decisiones tomadas con el usuario:

- **Modelado**: productos Shopify independientes (no variantes de un producto único).
- **Relación con kits PBN**: vive en Shopify — colección `pbn-accessories` + metafield `shopify--discovery--product_recommendation.related_products` para curación fina. Sin tabla de asociaciones en Postgres.
- **Checkout**: cross-sell UI + **bundle con descuento** vía descuento automático nativo de Shopify "Buy X Get Y" (compra kit PBN → % off en colección de accesorios). Sin Shopify Functions.
- **Storefront**: los accesorios tienen página de producto propia con template nueva.
- **Fulfillment**: inventario propio/manual. NO se crea una interface `FulfillmentProvider` (hoy todo el avance de producción es manual vía `productionStatus`; abstraer sería YAGNI). Los accesorios saltan los estados de generación.

Hallazgos clave de la exploración: `artwork_family` no existe en el código — la clasificación real está en `ProductReference` (flags `isPaintByNumbers`, `isCreditPack` + campo `template`). Los credit packs ya sientan precedente de "camino especial" en el ingest (nacen en `delivered`).

## Cambios en backend (NestJS + Prisma)

### 1. Schema — `backend/prisma/schema.prisma`

- `ProductReference`: añadir `isAccessory Boolean @default(false)` con índice, junto a `isPaintByNumbers`/`isCreditPack` (l.315-316). Mismo patrón de flags existente. El campo `template` (string libre) admitirá el valor `"Accessory"` sin cambio de schema.
- Migración Prisma correspondiente.

### 2. Clasificación admin — `backend/src/products/`

- `products.service.ts`: método para marcar/desmarcar `isAccessory` (a diferencia de `setPbnProduct` l.240, NO es único — pueden ser muchos). Incluir `isAccessory` en las respuestas de listado admin.
- `admin-products.controller.ts`: endpoint `PATCH /admin/products/:id/accessory` (o extender el update existente), siguiendo el patrón de `setPbn`/`setCreditPack`.

### 3. Ingest de órdenes — `backend/src/orders/`

- `production-status.util.ts` — `computeAutoEarlyStatus()` (l.108): rama para accesorios — si el item es accesorio y la orden está pagada → `draft` directo; nunca pasa por `pending/generating/art_failed`. La máquina manual `VALID_TRANSITIONS` (draft → pre_production → … → shipped → delivered) se reutiliza tal cual; para stock propio el admin simplemente avanzará draft → shipped.
- `orders.service.ts` — `ingestLineItem()` (l.449): cuando `productReference.isAccessory`, no loguear warnings por falta de `generation_id`/`paint_by_numbers_id` (es lo esperado), `fulfillmentMethod = 'in_house'` (reusar valor existente, no crear `'stock'`), y aplicar el estado temprano de accesorio.

### 4. Lo que NO se hace

- Sin tabla de asociaciones, sin interface FulfillmentProvider, sin manejo de inventario propio en Postgres (el stock lo lleva Shopify; el frontend ya filtra por `availableForSale`).

## Configuración en Shopify (sin código)

1. Crear los productos accesorio con inventario gestionado por Shopify.
2. Crear colección `pbn-accessories`.
3. Descuento automático **Buy X Get Y**: "customer buys product from [colección kits PBN] → gets products from [pbn-accessories] at X% off". Se aplica automáticamente en checkout con el carrito de la Storefront API.
4. Opcional: curar `related_products` (Search & Discovery) por producto para el "You may also like" existente.

## Cambios en frontend (Next.js)

### 1. Template de página de producto

- Nueva `AccessoryTemplate.tsx` en `frontend/src/widgets/product-templates/ui/` y entrada `Accessory` en `TEMPLATE_MAP` de `ProductPageTemplate.tsx`. Versión simple: galería, precio, selector de cantidad, add-to-cart, descripción — sin selector de tamaño, sin lifestyle metaobject, sin lógica PBN. Usar la skill `clawandsoul-design-system` al implementar. Copy en inglés.

### 2. Upsell de accesorios en el flujo PBN

- Nuevo componente `AccessoryUpsell` en `frontend/src/features/pbn-purchase/`: obtiene la colección `pbn-accessories` vía la acción existente de colecciones (`frontend/src/lib/shopify/actions/collections.ts`) y renderiza cards compactas con add-to-cart directo, debajo de `PbnPurchaseCard.tsx`. Los items van al carrito como line items normales **sin atributos** (`generation_id`/`paint_by_numbers_id`) — cero acoplamiento con la lógica de generación. Handle de colección como constante de config del frontend (si luego se quiere configurable, existe el precedente `showcaseCollectionHandle` en `ProductReference`).
- Mensaje del descuento bundle en la card ("Add paints & brushes — X% off with your kit", copy en inglés).
- Reusar/extender `ProductShowcase` (`frontend/src/widgets/collection-showcase/`) para mostrar accesorios también en páginas de producto Canvas/Poster si aplica.

### 3. Carrito

- Verificar que la query de cart (`frontend/src/lib/shopify/queries/cart.ts`) incluye `discountAllocations`/`discountCodes` para mostrar el descuento Buy X Get Y en el carrito; añadirlos si faltan y renderizar el ahorro en la UI del carrito.

### 4. Admin (frontend)

- `frontend/src/entities/admin/api.ts` (~l.750): método para el toggle `isAccessory`; exponerlo en la vista admin de productos (Polaris, patrón existente de setPbn/setCreditPack).

## Verificación

- Claude: `tsc` + lint en frontend y backend tras editar (según preferencia del usuario, la prueba en navegador la hace él).
- Usuario (navegador):
  1. Marcar un producto como accesorio en el admin y asignarle template `Accessory` → su página usa la nueva template.
  2. En el widget PBN, ver las cards de accesorios y añadir uno al carrito junto al kit → el carrito muestra el descuento Buy X Get Y.
  3. Completar una orden de prueba con kit + accesorio → en el admin de órdenes, el item accesorio aparece en `draft` (sin pasar por `generating`), sin warnings de arte faltante, y se puede avanzar manualmente hasta `shipped`.

## Orden de implementación sugerido

1. Backend: schema + migración → clasificación admin → ingest.
2. Frontend admin: toggle accesorio.
3. Frontend storefront: AccessoryTemplate → AccessoryUpsell → carrito con descuentos.
4. Configuración Shopify (productos, colección, descuento automático) — la hace el usuario en el admin de Shopify.
