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
}

export default function AddToCartButton({
  product,
  selectedVariant,
  mainImage,
  productRefId,
  formatId,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

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

  return (
    <div className="flex flex-col gap-3 mt-2">
      <button
        onClick={handleAddToCart}
        className="w-full h-14 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">auto_fix_high</span>
        Personalize & Add to Cart
      </button>
    </div>
  );
}
