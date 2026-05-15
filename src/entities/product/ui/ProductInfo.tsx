import { Star } from "lucide-react";
import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

interface ProductInfoProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyVariant | undefined;
}

export default function ProductInfo({
  product,
  selectedVariant,
}: ProductInfoProps) {
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  const currencySymbol =
    price?.currencyCode === "USD" || "CAD" ? "$" : price?.currencyCode;

  const priceAmount = price ? parseFloat(price.amount).toFixed(2) : "";
  const originalAmount = compareAtPrice
    ? parseFloat(compareAtPrice.amount).toFixed(2)
    : "";

  const discount =
    price && compareAtPrice && parseFloat(compareAtPrice.amount) > 0
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100,
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Title + Availability */}
      <div className="flex flex-col gap-3">
        <span className="text-primary font-bold tracking-wider uppercase text-sm">
          Personalized
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-black text-text-main tracking-tight leading-[1.1]">
          {product.title}
        </h1>
      </div>
      {/* Reviews */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const fill = Math.min(1, Math.max(0, 4.8 - (star - 1)));
            return (
              <div key={star} className="relative w-5 h-5">
                <Star
                  size={20}
                  className="absolute inset-0 text-text-muted/20"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    size={20}
                    className="text-yellow-500"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <span className="text-sm text-text-muted font-medium">
          (4.8) <span className="font-normal">237 reseñas</span>
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="font-display text-4xl font-black text-text-main">
          {currencySymbol}
          {priceAmount}
        </span>
        {discount > 0 && (
          <span className="text-lg text-text-muted/60 line-through font-medium">
            {currencySymbol}
            {originalAmount}
          </span>
        )}
        {discount > 0 && (
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.1em] border border-primary/20">
            Save {discount}%
          </span>
        )}
      </div>

      {/* Selected Options Summary */}
      {selectedVariant?.selectedOptions &&
        selectedVariant.selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {selectedVariant.selectedOptions.map((option) => (
              <div key={option.name} className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {option.name}
                </span>
                <span className="font-body text-sm font-bold text-text-main">
                  {option.value}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
