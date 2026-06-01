# Página: Refund & Cancellation Policy

Guía para crear la página pública de **política de reembolsos y cancelaciones** del storefront.
Documento para el equipo (en español); el **copy de la página va en inglés**, igual que el resto
del storefront (footer, contacto). La fuente de verdad de diseño es
[`DESIGN.md`](./DESIGN.md) y `src/app/globals.css`.

---

## 1. Propósito

Claw & Soul vende **arte de mascotas personalizado bajo demanda (print-on-demand)** vía Shopify.
Como cada pieza es hecha a medida (impresa por proveedores tipo Pictorem), la política debe dejar
claro **cuándo se puede cancelar/reembolsar** y alinear lo que se le promete al cliente con lo que el
sistema realmente permite (ver §8). La página existe para:

- Cumplir requisitos de Shopify/pasarelas de pago (link a política de reembolsos).
- Reducir tickets de soporte respondiendo dudas comunes.
- Fijar expectativas: personalizado ⇒ no hay devoluciones por "cambié de opinión".

---

## 2. Ruta y archivo

| Item | Valor |
| --- | --- |
| Ruta pública | `/refund-policy` |
| Archivo | `src/app/refund-policy/page.tsx` |
| Tipo | Server Component estático (sin estado, sin data fetching) |
| Patrón base | Copiar el esqueleto de `src/app/contact/page.tsx` |

> Si en el futuro se agrupan legales, mover a `src/app/(legal)/refund-policy/page.tsx` con un
> `layout.tsx` compartido. Por ahora una página suelta es suficiente.

---

## 3. Estructura de la página

Mismo esqueleto que `contact/page.tsx`:

```tsx
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";

export const metadata = {
  title: "Refund & Cancellation Policy | Claw & Soul",
  description:
    "How cancellations, refunds, and returns work for your custom pet art at Claw & Soul.",
};

export default function RefundPolicy() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1 bg-cream">
        <div className="layout-container w-full flex flex-col items-center py-10 lg:py-16 px-4 md:px-10">
          <div className="layout-content-container flex flex-col max-w-[820px] w-full gap-10">
            {/* Header + secciones de política (ver §4 y §5) */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- **Ancho de lectura**: `max-w-[820px]` (texto largo legible; más angosto que las páginas con grid).
- **Fondo**: `bg-cream` (warm, no blanco puro — principio #1 del design system).
- Última actualización visible (ver header) para dar confianza legal.

---

## 4. Header de la página

```
Eyebrow:  "LEGAL"            → text-primary font-bold tracking-wider text-sm uppercase
H1:       "Refund & Cancellation Policy"  → text-text-main text-4xl md:text-5xl font-black tracking-[-0.033em]
Lead:     intro corta        → text-text-muted text-lg leading-relaxed
Meta:     "Last updated: {{FECHA}}"       → text-text-muted text-sm
```

**Lead sugerido (inglés):**
> Every Claw & Soul piece is custom-made for your pet, so our policy is a little different from
> off-the-shelf stores. Here's exactly how cancellations, refunds, and returns work.

---

## 5. Contenido de la política (copy en inglés, listo para usar)

Renderizar cada sección como bloque de prosa: `h2` (Epilogue `font-black text-2xl`) + párrafos
`text-text-main/80 leading-relaxed`. Opcional: envolver cada sección en una card
`bg-white rounded-xl shadow-sm border border-[#EBE9E4] p-6 md:p-8` para escaneo visual.

> ⚠️ Los `{{...}}` son decisiones de negocio que debes confirmar antes de publicar.

### 5.1 Order Cancellations
> You can request to cancel your order **before it enters production**. Because each item is
> custom-made for your pet, once we've started printing we usually can't cancel or change it.
>
> - **Before production starts** — full cancellation and full refund.
> - **Already in production** — cancellation may not be possible. If it is, a partial refund may
>   apply depending on how far along your piece is.
> - **Already shipped** — orders can't be cancelled once they ship (see Returns below).
>
> To request a cancellation, email **hello@clawandsoul.com** with your order number as soon as
> possible. We typically begin production within **{{X horas}}** of your order being placed.

### 5.2 Made-to-Order & Returns
> Because our products are personalized with your pet's image, they **cannot be returned or
> refunded for change of mind** — they can't be resold. Please double-check your design, size,
> and shipping address before checking out.
>
> We're happy to help you get the design right *before* you order — just reach out.

### 5.3 Damaged, Defective, or Wrong Items
> If your order arrives **damaged, defective, or different from what you ordered**, we'll make it
> right with a **free replacement or a full refund** — your choice.
>
> Contact us within **{{14}} days** of delivery at **hello@clawandsoul.com** with:
> - Your order number
> - A short description of the issue
> - Clear photos of the item and the packaging
>
> Please don't discard the packaging until the issue is resolved.

### 5.4 Lost or Undelivered Orders
> If tracking shows your order as delivered but you didn't receive it, or it's significantly
> delayed, contact us. After a short investigation with the carrier we'll arrange a replacement
> or refund.

### 5.5 Refunds — How & When
> Approved refunds are issued to your **original payment method** through Shopify. Once approved,
> refunds typically appear within **{{5–10}} business days**, depending on your bank or card
> issuer.
>
> **Shipping costs are non-refundable** unless the return is due to our error (a damaged,
> defective, or incorrect item).

### 5.6 How to Reach Us
> Questions about a refund or cancellation? Email **hello@clawandsoul.com** with your order number
> and we'll get back to you, usually within 24 hours.

---

## 6. Tokens y componentes (del design system)

| Elemento | Clases |
| --- | --- |
| Fondo página | `bg-cream` |
| Card de sección | `bg-white rounded-xl shadow-sm border border-[#EBE9E4] p-6 md:p-8` |
| H1 | `text-text-main text-4xl md:text-5xl font-black tracking-[-0.033em]` |
| H2 sección | `text-text-main text-2xl font-black` (Epilogue / `font-display`) |
| Párrafo | `text-text-main/80 text-base leading-relaxed` |
| Texto secundario | `text-text-muted` |
| Eyebrow | `text-primary font-bold tracking-wider text-sm uppercase` |
| Link (email/CTA) | `text-primary hover:text-primary-dark font-semibold transition-colors` |
| Iconos | Material Symbols Outlined (`material-symbols-outlined`), p. ej. `mail`, `local_shipping` |

Principios a respetar: un solo color de acción (`#448da6`), `rounded-xl` por defecto,
`transition-*` en interactivos, mobile-first desde 375px.

---

## 7. Integración

1. **Link en el footer** — añadir en `src/widgets/footer/ui/Footer.tsx`, columna **"Company"**
   (junto a `Privacy Policy`):
   ```tsx
   <Link className="text-white/70 hover:text-white transition-colors" href="/refund-policy">
     Refund Policy
   </Link>
   ```
2. **(Opcional) Checkout de Shopify** — enlazar esta URL desde la sección de políticas de la tienda
   en el admin de Shopify, para que aparezca en el checkout.
3. **Metadata/SEO** — usar el `export const metadata` del §3 (título + description).
4. **Sin auth, sin estado** — es contenido estático público; no usar `"use client"` salvo que se
   agregue interacción (no se necesita).

---

## 8. Consistencia con el sistema (importante)

La política debe reflejar lo que el panel admin ya hace al cancelar
(`src/app/admin/orders/[id]/page.tsx` + `backend/.../orders.service.ts cancelOrderItems`):

- **Estados cancelables**: `pending`, `paid`, `in_production` → el copy de §5.1 ("before it enters
  production / already in production / already shipped") está alineado con esto.
- **`shipped` / `delivered`**: no cancelables → solo aplica Returns por defecto/daño (§5.3).
- **Reembolso vía Shopify**: la cancelación desde la app reembolsa al método original (total si es
  pedido completo, parcial si es por item) → §5.5 promete exactamente eso.
- **POD / Pictorem**: ítems ya enviados al proveedor requieren gestión manual; de cara al cliente
  esto se traduce en "once we've started printing we usually can't cancel" (§5.1). No exponer
  detalles del proveedor en la página pública.

Si cambian las reglas de cancelación en el backend, **actualizar este copy** para que no se prometa
algo que el sistema no cumple.

---

## 9. Checklist de implementación

- [ ] Crear `src/app/refund-policy/page.tsx` con el esqueleto del §3.
- [ ] Volcar el copy del §5 (reemplazando los `{{...}}` con valores de negocio reales).
- [ ] Confirmar valores de negocio: ventana de cancelación, días para reportar daño, días de reembolso.
- [ ] Añadir el link "Refund Policy" en el footer (§7.1).
- [ ] Verificar responsive a 375px y legibilidad (`max-w-[820px]`, contraste slate/cream).
- [ ] `npm run lint` y revisar la página en `/refund-policy`.
- [ ] (Opcional) Enlazar la URL desde las políticas de Shopify para el checkout.
```
