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
      <div className="inline-flex w-fit items-center gap-2.5 rounded-xl bg-white px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="font-body text-base font-bold text-text-main">
            4.8
          </span>
          <Star
            size={16}
            className="text-yellow-500"
            fill="currentColor"
            strokeWidth={0}
          />
        </span>
        <span className="h-4 w-px bg-[#E0DED9]" />
        <span className="font-body text-sm text-text-muted">237 Reviews</span>
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
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.1em]">
            Save {discount}%
          </span>
        )}
      </div>

      {/* Short description — el texto completo vive en el acordeón de abajo */}
      {product.description && (
        <p className="font-body text-text-muted leading-relaxed line-clamp-3">
          {product.description}
        </p>
      )}
    </div>
  );
}
