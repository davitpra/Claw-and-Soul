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
    price?.currencyCode === "USD" ? "$" : price?.currencyCode;
  const priceAmount = price ? parseFloat(price.amount).toFixed(2) : "";
  const originalAmount = compareAtPrice
    ? parseFloat(compareAtPrice.amount).toFixed(2)
    : "";

  const discount =
    price && compareAtPrice && parseFloat(compareAtPrice.amount) > 0
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl lg:text-5xl font-bold text-text-main tracking-tight leading-[1.15]">
          {product.title}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {selectedVariant?.availableForSale ? (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em] border border-emerald-100 shadow-sm">
              Ready to Ship
            </span>
          ) : (
            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em] border border-slate-200 shadow-sm">
              Sold Out
            </span>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-4">
        <div className="flex items-center gap-1">
          <span className="text-4xl font-black text-primary">
            {currencySymbol}
            {priceAmount}
          </span>
        </div>
        {discount > 0 && (
          <span className="text-xl text-text-muted/60 line-through decoration-text-muted/30 font-medium">
            {currencySymbol}
            {originalAmount}
          </span>
        )}
        {discount > 0 && (
          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em] border border-red-100 shadow-sm">
            Save {discount}%
          </span>
        )}
      </div>
      {/* Selected Options Summary */}
      {selectedVariant?.selectedOptions &&
        selectedVariant.selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            {selectedVariant.selectedOptions.map((option) => (
              <div key={option.name} className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
                  {option.name}
                </span>
                <span className="text-sm font-bold text-text-main">
                  {option.value}
                </span>
              </div>
            ))}
          </div>
        )}

      <div className="h-px w-full bg-gradient-to-r from-text-main/15 via-text-main/5 to-transparent"></div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-widest flex items-center gap-2">
          Description
        </h3>
        <div
          className="text-text-muted leading-relaxed text-base font-medium max-w-prose"
          dangerouslySetInnerHTML={{ __html: product.description }}
        ></div>
      </div>
    </div>
  );
}
