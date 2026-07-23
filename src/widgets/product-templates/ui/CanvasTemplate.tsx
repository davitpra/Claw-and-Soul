"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import { StyleCollection } from "@/widgets/collection";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { PrintedOption } from "@/widgets/printed-option";

import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { getSimilarProducts } from "@/entities/product/lib/getSimilarProducts";
import { SameStyleGallery } from "@/widgets/expanding-gallery";
import { SimilarSouls } from "@/widgets/similar-souls";
import { AIProcess, type ProcessStep } from "@/widgets/ai-process";
import WavesDivider from "@/shared/ui/WavesDivider";

const CANVAS_STEPS: ProcessStep[] = [
  {
    img: "/process/2 approve.png",
    alt: "Choose Style Illustration",
    title: "1. Choose Your Style",
    text: "Pick an art style for your pet, select size and click Personalize.",
  },
  {
    img: "/process/1. Upload Picture.png",
    alt: "Upload Illustration",
    title: "Upload Pet Photo",
    text: "Add a clear photo of your pet in JPG, PNG or WEBP format.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Result Illustration",
    title: "Get Your Masterpiece",
    text: "Preview your masterpiece in seconds.",
  },
];

export default function CanvasTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
  frameStyle,
  template,
  artKind,
}: ProductTemplateProps) {
  const similarProducts = getSimilarProducts(product);
  const relatedAccessories = getRelatedAccessories(product);
  // Un canvas puede llevar el coloreable (para pintar) o arte terminado; los
  // bloques de pintura (accesorios, alternativa impresa) solo aplican al primero.
  const isPaintable = artKind === "pbn";

  return (
    <>
      <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
        <div className="layout-content-container flex flex-col max-w-300 w-full gap-8">
          <ProductDetails
            product={product}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            mainImage={mainImage}
            setMainImage={setMainImage}
            frameStyle={frameStyle}
            template={template}
            artKind={artKind}
          />
        </div>
      </div>

      <StyleCollection handle={handle} frameStyle={frameStyle} />
      <WavesDivider
        waveColor="var(--color-cream)"
        fillColor="var(--color-cream)"
      />
      <AIProcess
        eyebrow="HOW TO USE"
        title="Get your custom pet portrait in 3 easy steps"
        subtitle={
          <>
            Watch your pet become a masterpiece in seconds.
            <br />
            Try it free before you buy.
          </>
        }
        steps={CANVAS_STEPS}
        background="cream"
      />
      <WavesDivider
        waveColor="var(--color-cream)"
        fillColor="var(--color-cream)"
        flip
      />
      <SameStyleGallery handle={handle} />
      {similarProducts.length > 0 && (
        <SimilarSouls products={similarProducts} />
      )}
      {isPaintable && relatedAccessories.length > 0 && (
        <>
          <WavesDivider
            waveColor="var(--color-cream)"
            fillColor="var(--color-cream)"
          />
          <RelatedProducts accessories={relatedAccessories} />
          <WavesDivider
            waveColor="var(--color-cream)"
            fillColor="var(--color-cream)"
            flip
          />
        </>
      )}
      {isPaintable && <PrintedOption handle={handle} />}
      <ProductFAQ faqs={faqs} />
    </>
  );
}
