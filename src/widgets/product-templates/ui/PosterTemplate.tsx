"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { CollectionSection, useStyleCollection } from "@/widgets/collection";
import { PrintedOption } from "@/widgets/printed-option";
import {
  ExpandingGallery,
  useSameStyleItems,
} from "@/widgets/expanding-gallery";
import SectionFlow from "@/shared/ui/SectionFlow";

export default function PosterTemplate({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  faqs,
  handle,
  frameStyle,
  template,
  artKind,
}: ProductTemplateProps) {
  // Resueltos acá para que SectionFlow sepa qué secciones van a tener contenido
  // antes de repartir los fondos y los divisores.
  const styleCollection = useStyleCollection(handle);
  const { items: sameStyleItems, styleName } = useSameStyleItems(handle);

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

      <SectionFlow
        start="white"
        sections={[
          {
            id: "styles",
            when: styleCollection.hasContent,
            node: (
              <CollectionSection
                images={styleCollection.images}
                isLoading={styleCollection.isLoading}
                error={styleCollection.error}
                frameStyle={frameStyle}
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
            // La alternativa impresa solo tiene sentido en el poster coloreable.
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
