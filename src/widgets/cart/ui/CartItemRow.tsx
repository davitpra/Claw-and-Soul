"use client";

import Image from "next/image";
import { useCart, type CartItem } from "@/context/CartContext";

const MOBILE_LABEL =
  "md:hidden text-[11px] font-black text-slate-dark/40 uppercase tracking-widest";

function StepperButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="size-8 md:size-10 flex items-center justify-center text-slate-dark/60 hover:text-primary transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

interface CartItemRowProps {
  item: CartItem;
  /** Ahorro de esta línea por el descuento automático (0 si no aplica). */
  discount: number;
  discountTitle: string;
}

export default function CartItemRow({
  item,
  discount,
  discountTitle,
}: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  const lineTotal = item.price * item.quantity;
  // Los detalles son opcionales y comparten estilo: se pintan en un solo map.
  const details = [
    { label: "Size", value: item.size },
    { label: "Style", value: item.style },
    { label: "Color", value: item.color },
  ].filter((detail) => !!detail.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center py-8 border-b border-slate-dark/10 last:border-none relative group">
      <div className="col-span-1 md:col-span-6 flex gap-6">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-slate-dark/5 relative">
          {item.generationId && !item.imageUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-50 px-2">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary">
                progress_activity
              </span>
              <p className="text-[9px] font-bold text-slate-500 text-center leading-tight">
                Creating your artwork…
              </p>
            </div>
          ) : (
            <Image
              src={item.img}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center gap-1">
          <h3 className="font-display font-black text-lg text-slate-dark leading-tight">
            {item.name}
          </h3>
          {details.map(({ label, value }) => (
            <p key={label} className="text-sm text-slate-dark/60 font-medium">
              {label}: {value}
            </p>
          ))}
          {discount > 0 && (
            <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-[12px]">
                sell
              </span>
              {discountTitle}
            </span>
          )}
          <button
            onClick={() => removeItem(item.variantId)}
            className="text-[11px] text-red-500 font-black uppercase tracking-wider hover:opacity-70 mt-3 text-left w-fit flex items-center gap-1 transition-opacity"
          >
            <span className="material-symbols-outlined text-[14px]">
              delete
            </span>
            Remove
          </button>
        </div>
      </div>

      <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center">
        <span className={MOBILE_LABEL}>Quantity</span>
        <div className="flex items-center rounded-full border border-slate-dark/10 bg-white">
          <StepperButton
            icon="remove"
            label="Decrease quantity"
            onClick={() => updateQuantity(item.variantId, -1)}
          />
          <span className="w-8 md:w-12 text-center text-slate-dark font-black text-sm md:text-base">
            {item.quantity}
          </span>
          <StepperButton
            icon="add"
            label="Increase quantity"
            onClick={() => updateQuantity(item.variantId, 1)}
          />
        </div>
      </div>

      <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end">
        <span className={MOBILE_LABEL}>Total</span>
        {discount > 0 ? (
          <span className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-dark/40 line-through">
              ${lineTotal.toFixed(2)}
            </span>
            <span className="text-lg font-black text-primary">
              ${Math.max(0, lineTotal - discount).toFixed(2)}
            </span>
          </span>
        ) : (
          <span className="text-lg font-black text-slate-dark">
            ${lineTotal.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
