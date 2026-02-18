"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, use } from "react";
import { getProduct, ShopifyProduct } from "@/lib/shopify";
import Link from "next/link";
import Breadcrumbs from "@/shared/ui/Breadcrumbs";
import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import ProductEssence from "@/widgets/product-essence/ui/ProductEssence";

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
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-main mb-4">
              Product Not Found
            </h1>
            <Link
              href="/shop"
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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.title },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      <Navbar />

      <main className="flex-1 flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full gap-8">
          <Breadcrumbs items={breadcrumbItems} />

          <ProductDetails
            product={product}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            mainImage={mainImage}
            setMainImage={setMainImage}
          />

          <ProductEssence />

          <ProductFAQ faqs={faqs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
