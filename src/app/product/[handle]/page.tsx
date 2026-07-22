"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { useState, useEffect, use } from "react";
import { getProduct, ShopifyProduct } from "@/lib/shopify";
import Link from "next/link";
import { ProductPageTemplate } from "@/widgets/product-templates";
import { useBackendProductVariants } from "@/hooks/useBackendProductVariants";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const { product: backendProduct } = useBackendProductVariants(handle);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const fetchedProduct = await getProduct(handle);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setSelectedVariantId(fetchedProduct.variants.edges[0]?.node.id || "");
          setMainImage(fetchedProduct.images.edges[0]?.node.url || "");
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background-light">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-black text-text-main mb-4">
              Product Not Found
            </h1>
            <Link
              href="/catalog"
              className="text-primary font-bold hover:underline"
            >
              Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const faqs = [
    {
      q: "What kind of photo works best?",
      a: "Clear, high-resolution photos with natural lighting work best. Make sure your pet's face is clearly visible and not blurry.",
    },
    {
      q: "Can I see the art before I buy?",
      a: "Absolutely! Our AI generator allows you to preview the artistic transformation for free before adding the product to your cart.",
    },
    {
      q: "How long does shipping take?",
      a: "Since each item is custom-made, production takes 3-5 business days. Shipping usually takes another 5-7 days depending on your location.",
    },
    {
      q: "Is the AI art unique?",
      a: "Yes. No two transformations are identical. The AI processes each photo uniquely to ensure your art is as one-of-a-kind as your pet.",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <ProductPageTemplate
          product={product}
          templateOverride={backendProduct?.template ?? undefined}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
          mainImage={mainImage}
          setMainImage={setMainImage}
          handle={handle}
          faqs={faqs}
        />
      </main>

      <Footer />
    </div>
  );
}
