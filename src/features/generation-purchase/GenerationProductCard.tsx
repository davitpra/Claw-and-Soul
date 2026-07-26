"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  buildSizeOptions,
  findVariantForSize,
  getSizeOptionName,
} from "@/entities/product/lib/sizeOptions";
import {
  formatPrice,
  variantLabel,
} from "@/entities/product/lib/variantPresentation";
import { PurchaseSizePicker } from "@/entities/product/ui/PurchaseSizePicker";
import OptionChips from "@/shared/ui/OptionChips";
import type { UseGenerationProductResult } from "./useGenerationProduct";

interface GenerationProductCardProps {
  /** Producto de origen ya resuelto por {@link useGenerationProduct}. */
  source: UseGenerationProductResult;
  generationId: string;
  /** La obra generada: miniatura de la card y `image_url` de la línea de carrito. */
  artworkUrl: string;
  /** "Canvas Print · Print Art", que el consumidor arma con template + artKind. */
  productLabel: string;
  /** Nombre del estilo; viaja al checkout como atributo "Style". */
  styleName?: string | null;
}

/**
 * Card de compra del producto para el que se pidió la generación (el canvas o
 * póster que el cliente eligió antes de generar), mostrada en el detalle de la
 * obra. Vende ese producto con la obra del usuario: la línea de carrito viaja
 * con `generationId` + `imageUrl`, que el checkout convierte en las propiedades
 * `generation_id` / `image_url` y el webhook de órdenes usa para reasociar el
 * arte — el mismo contrato que ya usa el ia-generator.
 *
 * Para obras digitales el detalle sigue mostrando el kit Paint-by-Numbers; esta
 * card cubre los formatos físicos.
 */
export function GenerationProductCard({
  source,
  generationId,
  artworkUrl,
  productLabel,
  styleName,
}: GenerationProductCardProps) {
  const { product, variants, defaultImage, preselectedVariantId } = source;
  const { addToCart } = useCart();

  // Sin formato mapeado, el mismo criterio que el kit PBN: la del medio cuando
  // hay tres tallas, si no la primera.
  const fallbackVariantId = useMemo(() => {
    if (variants.length === 0) return null;
    const mid = variants[Math.floor(variants.length / 2)];
    return (variants.length === 3 ? mid : variants[0]).id;
  }, [variants]);

  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const selectedId = variantId ?? preselectedVariantId ?? fallbackVariantId;
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (!product || !selected) return null;

  // Miniatura: la obra generada manda. Al revés que en el kit PBN, donde la foto
  // del producto enseña el lienzo numerado — aquí lo que se vende es *tu* obra
  // sobre este soporte.
  const thumbUrl = artworkUrl || selected.image?.url || defaultImage;

  const unitPrice = Number.parseFloat(selected.price.amount) || 0;
  const currency = selected.price.currencyCode || "CAD";
  const total = unitPrice * qty;

  // Eje talla: `sizeOptions` ya mantiene fijas las demás opciones al saltar de
  // talla y marca las agotadas, así que no se recalcula nada aquí.
  const sizeOptionName = getSizeOptionName(product);
  const sizeOptions = buildSizeOptions(product, selected);
  const selectedSize = sizeOptionName
    ? selected.selectedOptions.find((o) => o.name === sizeOptionName)?.value
    : undefined;

  // Ejes restantes (marco, acabado…). "set" nunca se expone, igual que en
  // ProductVariantSelector.
  const allVariants = product.variants.edges.map((e) => e.node);
  const optionNames = allVariants[0]?.selectedOptions.map((o) => o.name) ?? [];
  const otherOptionNames = optionNames.filter(
    (name) => name !== sizeOptionName && name.toLowerCase() !== "set",
  );
  const currentOptions: Record<string, string> = Object.fromEntries(
    selected.selectedOptions.map((o) => [o.name, o.value]),
  );

  /** Valores de un eje, marcando como agotados los que no tienen stock en ninguna variante. */
  const valuesFor = (name: string) => {
    const values = [
      ...new Set(
        allVariants
          .map((v) => v.selectedOptions.find((o) => o.name === name)?.value)
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    return values.map((value) => ({
      value,
      label: value,
      disabled: !allVariants.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.some((o) => o.name === name && o.value === value),
      ),
    }));
  };

  const changeOption = (name: string, value: string) => {
    const next = { ...currentOptions, [name]: value };
    // Si la combinación exacta no existe (ese acabado no se hace en esta talla),
    // se cae a la primera variante con el valor elegido: ignorar el clic dejaría
    // el chip muerto sin explicación.
    // Solo variantes comprables: `variants` ya viene filtrado, así nunca llega
    // al carrito una agotada.
    const match =
      variants.find((v) =>
        v.selectedOptions.every((o) => next[o.name] === o.value),
      ) ??
      variants.find((v) =>
        v.selectedOptions.some((o) => o.name === name && o.value === value),
      );
    if (match) setVariantId(match.id);
  };

  /** Precio de una talla manteniendo el resto de opciones, para su ficha. */
  const priceForSize = (size: string) => {
    const variant = findVariantForSize(product, selected, size);
    if (!variant) return undefined;
    return formatPrice(
      Number.parseFloat(variant.price.amount) || 0,
      variant.price.currencyCode,
    );
  };

  const changeSize = (value: string) => {
    // `findVariantForSize` respeta las demás opciones pero puede devolver una
    // agotada; si lo hace, cualquier otra variante comprable de esa talla sirve.
    const match = findVariantForSize(product, selected, value);
    const available =
      match?.availableForSale === true
        ? match
        : variants.find((v) =>
            v.selectedOptions.some(
              (o) => o.name === sizeOptionName && o.value === value,
            ),
          );
    if (available) setVariantId(available.id);
  };

  const handleAdd = () => {
    addToCart({
      id: `gen-${generationId}-${selected.id}`,
      variantId: selected.id,
      name: product.title,
      size: variantLabel(selected),
      style: styleName ?? undefined,
      price: unitPrice,
      quantity: qty,
      img: artworkUrl || selected.image?.url || defaultImage || "",
      generationId,
      imageUrl: artworkUrl || undefined,
    });
    setAdded(true);
  };

  return (
    // Container query, no viewport: la card vive en la columna sticky (~440px)
    // del detalle de la obra, así que el split en dos columnas depende de su
    // ancho real, no del de la pantalla.
    <div className="@container h-full w-full">
      <div className="h-full rounded-2xl bg-white p-5 sm:p-6 @2xl:grid @2xl:grid-cols-2 @2xl:gap-x-8">
        {/* Columna izquierda en ancho: qué es el producto. */}
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="size-14 shrink-0 overflow-hidden rounded-xl border border-[#E0DED9] bg-cream bg-cover bg-center"
              style={
                thumbUrl ? { backgroundImage: `url(${thumbUrl})` } : undefined
              }
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {productLabel}
              </p>
              <h3 className="font-display text-lg font-black leading-tight text-slate-dark">
                {product.title}
              </h3>
              <p className="mt-0.5 text-[13px] text-text-muted">
                {styleName
                  ? `${styleName} · printed with your artwork`
                  : "Printed with your artwork"}
              </p>
            </div>
          </div>

          {/* Descripción del producto — HTML redactado en el admin de Shopify
              (Shopify sanea descriptionHtml, así que es una fuente confiable). */}
          {product.descriptionHtml ? (
            <div>
              <div
                className={`pbn-desc text-[13px] leading-relaxed text-text-muted ${
                  descExpanded ? "" : "line-clamp-4"
                }`}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
              {product.description.length > 160 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 text-[12px] font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          ) : (
            product.description && (
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-muted">
                {product.description}
              </p>
            )
          )}
        </div>

        {/* Columna derecha en ancho: configurar + comprar. */}
        <div className="@2xl:border-l @2xl:border-[#E0DED9] @2xl:pl-8">
          {sizeOptionName && sizeOptions.length > 1 && (
            <PurchaseSizePicker
              label="Choose a size"
              ariaLabel={`${product.title} size`}
              value={selectedSize ?? ""}
              onChange={changeSize}
              options={sizeOptions.map((o) => ({
                value: o.value,
                label: o.label,
                price: priceForSize(o.value),
                disabled: o.disabled,
              }))}
            />
          )}

          <div className="mb-5 flex flex-col gap-5 empty:mb-0">
            {otherOptionNames.map((name) => {
              const options = valuesFor(name);
              if (options.length < 2) return null;
              return (
                <OptionChips
                  key={name}
                  name={`gen-${generationId}-${name}`}
                  label={name}
                  value={currentOptions[name] ?? ""}
                  options={options}
                  onChange={(value) => changeOption(name, value)}
                />
              );
            })}
          </div>

          <div className="mb-4 h-px bg-[#E0DED9]" />

          {/* Cantidad + total */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text-muted">
                Quantity
              </span>
              <div className="flex items-center overflow-hidden rounded-xl border border-[#E0DED9]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="grid size-9 place-items-center text-primary transition-colors hover:bg-cream disabled:text-black/20 disabled:hover:bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    remove
                  </span>
                </button>
                <span className="w-9 text-center text-sm font-bold text-slate-dark">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  disabled={qty >= 10}
                  className="grid size-9 place-items-center text-primary transition-colors hover:bg-cream disabled:text-black/20 disabled:hover:bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-text-muted">Total</p>
              <p className="font-display sm:text-xl font-black leading-none text-slate-dark">
                {formatPrice(total, currency)}
              </p>
            </div>
          </div>

          {/* CTA */}
          {added ? (
            <Link
              href="/cart"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3.5 text-[15px] font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">
                shopping_cart
              </span>
              View cart
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark"
            >
              <span className="material-symbols-outlined text-[20px]">
                shopping_bag
              </span>
              Add to cart
            </button>
          )}

          {/* Tranquilizadores */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <span className="material-symbols-outlined text-[16px] text-primary">
              local_shipping
            </span>
            ships in 5–7 days
          </div>
          <div className="mt-2 flex items-start justify-center gap-1 text-[11px] text-black/40">
            <span className="material-symbols-outlined text-[13px]">info</span>
            Printed with the artwork you generated.
          </div>
        </div>
      </div>
    </div>
  );
}
