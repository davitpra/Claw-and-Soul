# Línea de accesorios PBN — Plan de implementación por fases

## Contexto

Se añade una línea de productos complementarios genéricos (pinturas, pinceles, marcadores, paletas…): no se generan por IA, no tienen relación 1:1 con una obra, y se venden solos o junto a cualquier kit PBN. Decisiones tomadas con el usuario:

- **Modelado**: productos Shopify independientes (no variantes de un producto único).
- **Relación con kits PBN**: vive en Shopify — colección `pbn-accessories` + metafield `related_products` para curación fina. Sin tabla de asociaciones en Postgres.
- **Checkout**: cross-sell UI + bundle con descuento vía descuento automático nativo de Shopify "Buy X Get Y". Sin Shopify Functions.
- **Storefront**: los accesorios tienen página de producto propia con template nueva (`Accessory`).
- **Fulfillment**: inventario propio/manual. NO se crea interface `FulfillmentProvider` (todo el avance de producción ya es manual vía `productionStatus`). Los accesorios saltan los estados de generación.

Hallazgos clave: `artwork_family` no existe en el código — la clasificación real está en `ProductReference` (flags `isPaintByNumbers`, `isCreditPack` + campo `template`). Los credit packs ya sientan precedente de "camino especial" en el ingest (nacen en `delivered`).

---

## Fase 1 — Backend: modelo de datos y clasificación

- [ ] **1.1** Añadir `isAccessory Boolean @default(false)` (con índice) a `ProductReference` en `backend/prisma/schema.prisma`, junto a `isPaintByNumbers`/`isCreditPack` (l.315-316). El campo `template` (string libre) admitirá `"Accessory"` sin cambio de schema.
- [ ] **1.2** Generar y aplicar la migración Prisma.
- [ ] **1.3** En `backend/src/products/products.service.ts`: método para marcar/desmarcar `isAccessory` (NO único, a diferencia de `setPbnProduct` l.240 — pueden ser muchos accesorios). Incluir `isAccessory` en las respuestas de listado admin.
- [ ] **1.4** En `backend/src/products/admin-products.controller.ts`: endpoint `PATCH /admin/products/:id/accessory`, siguiendo el patrón de `setPbn`/`setCreditPack`.
- [ ] **1.5** Verificar: `tsc` + lint del backend.

## Fase 2 — Backend: ingest de órdenes y estados de producción

- [ ] **2.1** En `backend/src/orders/production-status.util.ts` — `computeAutoEarlyStatus()` (l.108): rama para accesorios — si el item es accesorio y la orden está pagada → `draft` directo (nunca `pending/generating/art_failed`). La máquina manual `VALID_TRANSITIONS` se reutiliza tal cual (el admin avanzará draft → shipped).
- [ ] **2.2** En `backend/src/orders/orders.service.ts` — `ingestLineItem()` (l.449): cuando `productReference.isAccessory` → no loguear warnings por falta de `generation_id`/`paint_by_numbers_id` (es lo esperado), `fulfillmentMethod = 'in_house'` (reusar valor existente), aplicar el estado temprano de accesorio.
- [ ] **2.3** Verificar: `tsc` + lint del backend.

## Fase 3 — Frontend admin: toggle de accesorio

- [ ] **3.1** En `frontend/src/entities/admin/api.ts` (~l.750): método para el toggle `isAccessory`, junto a `products.setPbn`/`setCreditPack`.
- [ ] **3.2** Exponer el toggle en la vista admin de productos (Polaris, mismo patrón visual que los flags PBN/credit-pack existentes).
- [ ] **3.3** Verificar: `tsc` + lint del frontend.

## Fase 4 — Frontend storefront: página de producto de accesorio

- [ ] **4.1** Crear `AccessoryTemplate.tsx` en `frontend/src/widgets/product-templates/ui/`: galería, precio, selector de cantidad, add-to-cart, descripción — sin selector de tamaño, sin lifestyle metaobject, sin lógica PBN. Usar la skill `clawandsoul-design-system`; copy en inglés.
- [ ] **4.2** Registrar `Accessory` en `TEMPLATE_MAP` de `ProductPageTemplate.tsx`.
- [ ] **4.3** Verificar: `tsc` + lint del frontend.

## Fase 5 — Frontend storefront: upsell y carrito

- [ ] **5.1** Crear `AccessoryUpsell` en `frontend/src/features/pbn-purchase/`: obtiene la colección `pbn-accessories` vía la acción existente (`frontend/src/lib/shopify/actions/collections.ts`) y renderiza cards compactas con add-to-cart directo, debajo de `PbnPurchaseCard.tsx`. Los items van al carrito como line items normales **sin atributos** (`generation_id`/`paint_by_numbers_id`). Handle de colección como constante de config del frontend.
- [ ] **5.2** Añadir el mensaje del descuento bundle en la card ("Add paints & brushes — X% off with your kit", copy en inglés).
- [ ] **5.3** Revisar la query de cart (`frontend/src/lib/shopify/queries/cart.ts`): añadir `discountAllocations`/`discountCodes` si faltan, y renderizar el ahorro del Buy X Get Y en la UI del carrito.
- [ ] **5.4** Opcional: reusar `ProductShowcase` (`frontend/src/widgets/collection-showcase/`) para mostrar accesorios también en páginas Canvas/Poster.
- [ ] **5.5** Verificar: `tsc` + lint del frontend.

## Fase 6 — Configuración en Shopify (manual, la hace el usuario)

- [ ] **6.1** Crear los productos accesorio con inventario gestionado por Shopify.
- [ ] **6.2** Crear la colección `pbn-accessories` y añadir los accesorios.
- [ ] **6.3** Crear el descuento automático **Buy X Get Y**: "customer buys product from [colección kits PBN] → gets products from [pbn-accessories] at X% off".
- [ ] **6.4** Opcional: curar `related_products` (Search & Discovery) por producto.
- [ ] **6.5** Marcar los accesorios con el toggle `isAccessory` y template `Accessory` en el admin propio.

## Fase 7 — Verificación end-to-end (usuario, en navegador)

- [ ] **7.1** La página de un producto accesorio usa la nueva `AccessoryTemplate`.
- [ ] **7.2** En el widget PBN aparecen las cards de accesorios; al añadir kit + accesorio, el carrito muestra el descuento Buy X Get Y.
- [ ] **7.3** Completar una orden de prueba con kit + accesorio → en el admin de órdenes, el item accesorio aparece en `draft` (sin pasar por `generating`), sin warnings de arte faltante, y se puede avanzar manualmente hasta `shipped`.
