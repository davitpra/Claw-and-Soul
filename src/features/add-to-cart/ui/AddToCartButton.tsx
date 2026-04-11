"use client";

import { useRouter } from "next/navigation";
import { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyVariant | undefined;
  mainImage: string;
  productRefId?: string;
  formatId?: string;
  isCompatLoading?: boolean;
  hasBackendMapping?: boolean;
  backendError?: string | null;
}

export default function AddToCartButton({
  product,
  selectedVariant,
  mainImage,
  productRefId,
  formatId,
  isCompatLoading = false,
  hasBackendMapping = false,
  backendError = null,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const isDisabled =
    !selectedVariant ||
    isCompatLoading ||
    !!backendError ||
    !hasBackendMapping ||
    !formatId;

  const handleAddToCart = () => {
    if (!product || !selectedVariant || isDisabled) return;

    addToCart({
      id: product.id,
      variantId: selectedVariant.id,
      name: product.title,
      price: parseFloat(selectedVariant.price.amount),
      quantity: 1,
      img: mainImage,
      style: "Original",
      size: selectedVariant.title,
    });

    const params = new URLSearchParams();
    if (productRefId) params.set("product_ref_id", productRefId);
    if (formatId) params.set("format_id", formatId);
    const query = params.toString();
    router.push(`/ia-generator${query ? `?${query}` : ""}`);
  };

  const label = isCompatLoading
    ? "Loading options…"
    : backendError
      ? "Unavailable for personalization"
      : !hasBackendMapping
        ? "Unavailable for personalization"
        : !selectedVariant
          ? "Select a size"
          : !formatId
            ? "This size can't be personalized yet"
            : "Personalize & Add to Cart";

  return (
    <div className="flex flex-col gap-3 mt-2">
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="w-full h-14 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <span className="material-symbols-outlined">auto_fix_high</span>
        {label}
      </button>
      {backendError && (
        <p className="text-sm text-red-600 text-center">{backendError}</p>
      )}
    </div>
  );
}
