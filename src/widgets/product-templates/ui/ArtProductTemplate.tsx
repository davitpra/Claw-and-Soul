"use client";

import ProductDetails from "@/widgets/product-details/ui/ProductDetails";
import { StyleShowcase, useStyleCollection } from "@/widgets/collection";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import { ProductTemplateProps } from "./ProductPageTemplate";
import { PrintedOption } from "@/widgets/printed-option";
import {
  RelatedProducts,
  getRelatedAccessories,
} from "@/widgets/related-products";
import { getSimilarProducts } from "@/entities/product/lib/getSimilarProducts";
import {
  ExpandingGallery,
  useSameStyleItems,
} from "@/widgets/expanding-gallery";
import { SimilarSouls } from "@/widgets/similar-souls";
import { AIProcess } from "@/widgets/ai-process";
import SectionFlow from "@/shared/ui/SectionFlow";
import { getProcessSteps, isPaintableProduct } from "../model/artTemplateConfig";

/**
 * Storefront template de los productos de arte: los tres formatos de entrega
 * (Digital, Canvas, Poster) comparten la misma página —ficha + este orden de
 * secciones— y solo se diferencian en qué bloques aparecen.
 *
 * Dos ejes deciden esas diferencias: `template` (el formato) y `artKind` (si la
 * obra es coloreable o arte terminado). Las reglas están en
 * `model/artTemplateConfig.ts`; acá solo se aplican.
 */
export default function ArtProductTemplate({
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
  // Los bloques de pintura (accesorios, alternativa impresa) solo aplican a la
  // obra coloreable.
  const isPaintable = isPaintableProduct(template, artKind);
  const processSteps = getProcessSteps(template, isPaintable);

  // Los datos de estas dos secciones se resuelven acá y no dentro de su widget:
  // SectionFlow necesita saber cuáles van a tener contenido antes de repartir
  // los fondos, o la alternancia queda corrida y sobra un divisor.
  const styleCollection = useStyleCollection(handle);
  const { items: sameStyleItems, styleName } = useSameStyleItems(handle);

  return (
    <>
      <div className="flex justify-center py-6 md:py-10 px-4 md:px-10 lg:px-40">
        <div className=" max-w-300 w-full gap-8">
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
              <StyleShowcase
                collection={styleCollection}
                frameStyle={frameStyle}
              />
            ),
          },
          {
            id: "process",
            node: (
              <AIProcess
                eyebrow="HOW TO USE"
                // Derivado de los pasos: el coloreable suma un cuarto y el copy
                // no puede quedarse en "3".
                title={`Get your custom pet portrait in ${processSteps.length} easy steps`}
                subtitle={
                  <>
                    Watch your pet become a masterpiece in seconds.
                    <br />
                    Try it free before you buy.
                  </>
                }
                steps={processSteps}
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
            id: "similar",
            when: similarProducts.length > 0,
            node: <SimilarSouls products={similarProducts} />,
          },
          {
            id: "accessories",
            when: isPaintable && relatedAccessories.length > 0,
            node: (
              <RelatedProducts accessories={relatedAccessories} background="" />
            ),
          },
          {
            id: "printed",
            when: isPaintable,
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
