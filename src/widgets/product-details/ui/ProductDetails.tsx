"use client";

import { ShopifyProduct } from "@/lib/shopify";
import ProductGallery from "@/entities/product/ui/ProductGallery";
import ProductInfo from "@/entities/product/ui/ProductInfo";
import ProductVariantSelector from "@/entities/product/ui/ProductVariantSelector";
import ProductSizeSelector from "@/entities/product/ui/ProductSizeSelector";
import ProductTypeSelector from "@/entities/product/ui/ProductTypeSelector";
import ProductBreadcrumb from "@/entities/product/ui/ProductBreadcrumb";
import ProductPerks from "@/entities/product/ui/ProductPerks";
import PersonalizeButton from "@/features/personalize/ui/PersonalizeButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormatOptions } from "@/hooks/useFormatOptions";
import { useStyle } from "@/hooks/useStyle";
import { StyleOptionsForm } from "@/entities/art-style/ui/StyleOptionsForm";
import {
  buildSizeOptions,
  findVariantForSize,
  getSizeOptionName,
} from "@/entities/product/lib/sizeOptions";
import {
  buildTypeOptions,
  findVariantForType,
  getTypeOptionName,
} from "@/entities/product/lib/typeOptions";
import type { FrameStyle } from "@/entities/product/lib/frameStyle";

interface ProductDetailsProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  mainImage: string;
  setMainImage: (url: string) => void;
  frameStyle?: FrameStyle;
  /** Formato de entrega normalizado (Digital | Canvas | Poster…), para el label del tipo de producto. */
  template?: string;
  /** Contenido de la obra: "pbn" | "print"; undefined si no está asignado. */
  artKind?: string | null;
}

export default function ProductDetails({
  product,
  selectedVariantId,
  setSelectedVariantId,
  mainImage,
  setMainImage,
  frameStyle = "art",
  template,
  artKind,
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

  const selectedFormatOption = formats.find(
    (f) => f.shopifyVariantId === selectedVariantId,
  );

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

  // La lista de tallas y sus proporciones salen de Shopify (el valor de la
  // opción, ej. `8x10`), así que el selector sigue vivo sin backend.
  const sizeOptionName = getSizeOptionName(product);
  const sizeOptions = useMemo(
    () => buildSizeOptions(product, selectedVariant),
    [product, selectedVariant],
  );

  const handleSizeChange = (size: string) => {
    const variant = findVariantForSize(product, selectedVariant, size);
    if (variant) setSelectedVariantId(variant.id);
  };

  const selectedSize =
    selectedVariant?.selectedOptions.find((o) => o.name === sizeOptionName)
      ?.value ?? "";

  // `Type` (Rolled | Wrapped | Framed) tiene su propio selector, que además
  // explica el acabado elegido.
  const typeOptionName = getTypeOptionName(product);
  const typeOptions = useMemo(
    () => buildTypeOptions(product, selectedVariant),
    [product, selectedVariant],
  );

  const handleTypeChange = (type: string) => {
    const variant = findVariantForType(product, selectedVariant, type);
    if (variant) setSelectedVariantId(variant.id);
  };

  const selectedType =
    selectedVariant?.selectedOptions.find((o) => o.name === typeOptionName)
      ?.value ?? "";

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

  const hasOptions =
    detailedStyle?.templateVarOptions &&
    Object.keys(detailedStyle.templateVarOptions).length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
      {/* En mobile el rastro va arriba de la imagen; en lg+ lo toma el de la
          columna derecha, para que quede pegado al título. */}
      <ProductBreadcrumb product={product} className="lg:hidden" />
      <ProductGallery
        product={product}
        mainImage={mainImage}
        variantImage={selectedVariant?.image?.url}
        frameStyle={frameStyle}
      />

      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="sticky top-24 flex flex-col gap-6">
          <ProductBreadcrumb product={product} className="hidden lg:block" />

          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            template={template}
            artKind={artKind}
          />

          <div className="h-px w-full bg-text-main/10"></div>

          {sizeOptionName && (
            <ProductSizeSelector
              label={sizeOptionName}
              options={sizeOptions}
              value={selectedSize}
              onChange={handleSizeChange}
            />
          )}

          {typeOptionName && (
            <ProductTypeSelector
              label={typeOptionName}
              options={typeOptions}
              value={selectedType}
              onChange={handleTypeChange}
            />
          )}

          <ProductVariantSelector
            product={product}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />

          {hasOptions && (
            <>
              <div className="h-px w-full bg-linear-to-r from-text-main/15 via-text-main/5 to-transparent" />
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

          <ProductPerks template={template} />
        </div>
      </div>
    </div>
  );
}
