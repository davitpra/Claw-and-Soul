"use client";

import { StyleShowcase, useStyleCollection } from "@/widgets/collection";
import {
  ExpandingGallery,
  useSameStyleItems,
} from "@/widgets/expanding-gallery";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { PrintedOption } from "@/widgets/printed-option";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import SectionFlow from "@/shared/ui/SectionFlow";
import { AIProcess } from "@/widgets/ai-process";
import { PRODUCT_PROCESS_STEPS } from "../model/processSteps";

/**
 * Storefront template for digital downloads: the downloadable paint-by-numbers
 * coloring file of the customer's pet (not a physical kit). Same shape as
 * Canvas, plus the painting accessories upsell (paints, brushes…) from
 * getRelatedAccessories and the printed-art alternative for those who'd
 * rather not paint.
 */
export default function DigitalTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  handle,
  faqs,
  template,
  artKind,
}: ProductTemplateProps) {
  const relatedAccessories = getRelatedAccessories(product);

  // Resueltos acá para que SectionFlow sepa qué secciones van a tener contenido
  // antes de repartir los fondos y los divisores.
  const styleCollection = useStyleCollection(handle);
  const { items: sameStyleItems, styleName } = useSameStyleItems(handle);

  return (
    <>
      <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
        <div className="max-w-300 w-full gap-8">
          <ProductDetails
            product={product}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            mainImage={mainImage}
            setMainImage={setMainImage}
            template={template}
            artKind={artKind}
          />
        </div>
      </div>

      <SectionFlow
        start="white"
        sections={[
          {
            id: "styles",
            when: styleCollection.hasContent,
            node: <StyleShowcase collection={styleCollection} />,
          },
          {
            id: "process",
            node: (
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
                steps={PRODUCT_PROCESS_STEPS}
              />
            ),
          },
          {
            id: "gallery",
            when: sameStyleItems.length > 0,
            node: (
              <ExpandingGallery
                eyebrow={styleName ?? "Same style"}
                title="More in this style"
                items={sameStyleItems}
                background=""
              />
            ),
          },
          {
            id: "accessories",
            when: relatedAccessories.length > 0,
            node: (
              <RelatedProducts accessories={relatedAccessories} background="" />
            ),
          },
          {
            id: "printed",
            node: <PrintedOption handle={handle} />,
          },
          {
            id: "faq",
            node: <ProductFAQ faqs={faqs} background="" />,
          },
        ]}
      />
    </>
  );
}
