"use client";

import { ShopifyProduct } from "@/lib/shopify";
import ProductGallery from "@/entities/product/ui/ProductGallery";
import ProductInfo from "@/entities/product/ui/ProductInfo";
import ProductVariantSelector from "@/entities/product/ui/ProductVariantSelector";
import PersonalizeButton from "@/features/personalize/ui/PersonalizeButton";
import ProductAccordions from "./ProductAccordions";
import { useEffect, useRef, useState } from "react";
import { useFormatOptions } from "@/hooks/useFormatOptions";
import { useStyle } from "@/hooks/useStyle";
import { StyleOptionsForm } from "@/entities/art-style/ui/StyleOptionsForm";
import { getLifestyleImage } from "@/entities/product/lib/getLifestyleImage";
import { getSizeScale } from "@/entities/product/lib/getSizeScale";
import type { FrameStyle } from "@/widgets/product-templates/ui/ProductPageTemplate";

interface ProductDetailsProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
  frameStyle?: FrameStyle;
}

export default function ProductDetails({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  frameStyle = "art",
}: ProductDetailsProps) {
  const selectedVariant = product.variants.edges.find(
    (v) => v.node.id === selectedVariantId,
  )?.node;

  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setMainImage(selectedVariant.image.url);
    }
  }, [selectedVariant, setMainImage]);

  const {
    productRefId,
    styleId,
    formats,
    isLoading: isLoadingFormats,
    error: formatsError,
  } = useFormatOptions(product.handle);

  // Lifestyle image comes from the Shopify variant metafield "Size life style".
  const lifestyleImage = getLifestyleImage(selectedVariant);

  const selectedFormatOption = formats.find(
    (f) => f.shopifyVariantId === selectedVariantId,
  );

  // La variante por defecto es la primera de Shopify (page.tsx), que puede no
  // estar mapeada a un formato del backend → el botón "Personalize" aparecería
  // deshabilitado sin motivo aparente. Una sola vez, cuando cargan los formatos,
  // si la variante actual no es personalizable saltamos a la primera que sí lo
  // sea. Solo corre una vez para no pisar una selección deliberada del usuario.
  const didAutoSelectRef = useRef(false);
  useEffect(() => {
    if (didAutoSelectRef.current) return;
    if (isLoadingFormats || formats.length === 0) return;
    didAutoSelectRef.current = true;
    const isPersonalizable = formats.some(
      (f) => f.shopifyVariantId === selectedVariantId,
    );
    if (!isPersonalizable) {
      setSelectedVariantId(formats[0].shopifyVariantId);
    }
  }, [isLoadingFormats, formats, selectedVariantId, setSelectedVariantId]);

  const hasBackendMapping = !!productRefId;

  const { style: detailedStyle } = useStyle(styleId ?? null);
  const [selectionsState, setSelectionsState] = useState<{
    styleId: string | null;
    values: Record<string, string | number>;
  }>({ styleId: null, values: {} });

  const currentStyleId = detailedStyle?.id ?? null;
  if (selectionsState.styleId !== currentStyleId) {
    const defaults: Record<string, string | number> = {};
    if (detailedStyle?.templateVarOptions) {
      for (const [key, opt] of Object.entries(
        detailedStyle.templateVarOptions,
      )) {
        if (opt.default !== undefined) defaults[key] = opt.default;
      }
    }
    setSelectionsState({ styleId: currentStyleId, values: defaults });
  }

  const userSelections = selectionsState.values;

  const firstImageScale = getSizeScale(product, selectedVariant);

  const hasOptions =
    detailedStyle?.templateVarOptions &&
    Object.keys(detailedStyle.templateVarOptions).length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
      <ProductGallery
        product={product}
        mainImage={mainImage}
        otherSetImage={lifestyleImage}
        variantImage={selectedVariant?.image?.url}
        firstImageScale={firstImageScale}
        frameStyle={frameStyle}
      />

      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="sticky top-24 flex flex-col gap-6">
          <ProductInfo product={product} selectedVariant={selectedVariant} />

          <div className="h-px w-full bg-text-main/10"></div>

          <ProductVariantSelector
            product={product}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />

          <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />

          <ProductAccordions html={product.description} />

          <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />
          <div className="flex flex-col gap-1">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">
              Make It Yours
            </span>
          </div>
          {hasOptions && (
            <>
              <div>
                <StyleOptionsForm
                  options={detailedStyle!.templateVarOptions!}
                  value={userSelections}
                  onChange={(key, val) =>
                    setSelectionsState((prev) => ({
                      ...prev,
                      values: { ...prev.values, [key]: val },
                    }))
                  }
                />
              </div>
            </>
          )}

          <PersonalizeButton
            product={product}
            selectedVariant={selectedVariant}
            productRefId={productRefId ?? undefined}
            styleId={styleId ?? undefined}
            formatId={selectedFormatOption?.formatId}
            isCompatLoading={isLoadingFormats}
            hasBackendMapping={hasBackendMapping}
            backendError={formatsError}
            userSelections={hasOptions ? userSelections : undefined}
          />
        </div>
      </div>
    </div>
  );
}
