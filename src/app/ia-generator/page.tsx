"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  IAHeader,
  IAUploadStep,
  IAStyleStep,
  IALeadStep,
  IAThanksStep,
  IAProductStep,
  type SelectedProductInfo,
} from "@/widgets/ia-generator";

import { Style } from "@/entities/art-style/model/styles";
import { getFormatPhysicalSize } from "@/entities/product/lib/formatPhysicalSize";
import { normalizeTemplate } from "@/entities/product/lib/template";
import { useCompatStyles } from "@/hooks/useCompatStyles";
import { useAllStyles } from "@/hooks/useAllStyles";
import { useFormatOptions } from "@/hooks/useFormatOptions";
import { useGenerateImage, type GeneratePayload } from "@/hooks/useGenerateImage";
import { useCredits } from "@/hooks/useCredits";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function IAGeneratorContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const productRefIdFromUrl = searchParams.get("product_ref_id");
  const formatIdFromUrl = searchParams.get("format_id");
  const styleIdFromUrl = searchParams.get("style_id");
  const selectionsFromUrl = searchParams.get("selections");

  const [pickedProductRefId, setPickedProductRefId] = useState<string | null>(
    null,
  );
  const [pickedFormatId, setPickedFormatId] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<SelectedProductInfo | null>(
    null,
  );

  const productRefId = productRefIdFromUrl ?? pickedProductRefId;
  const formatId = formatIdFromUrl ?? pickedFormatId;
  const isFiltered = !!(productRefId && formatId);
  const needsProductSelection = !productRefId || !formatId;

  const {
    styles: allStyles,
    isLoading: isLoadingAllStyles,
    error: allStylesError,
  } = useAllStyles();

  const {
    styles: compatStyles,
    isLoading: isLoadingCompatStyles,
    error: compatStylesError,
  } = useCompatStyles(productRefId, formatId);

  const isLoadingStyles = isFiltered
    ? isLoadingCompatStyles
    : isLoadingAllStyles;
  const stylesError = isFiltered ? compatStylesError : allStylesError;
  const displayStyles: Style[] = isFiltered ? compatStyles : allStyles;

  const defaultStyle: Style | null = useMemo(() => {
    if (isLoadingStyles) return null;
    return displayStyles[0] ?? null;
  }, [displayStyles, isLoadingStyles]);

  const preselectedStyle: Style | null = useMemo(() => {
    if (!styleIdFromUrl || isLoadingStyles) return null;
    return displayStyles.find((s) => s.id === styleIdFromUrl) ?? null;
  }, [styleIdFromUrl, displayStyles, isLoadingStyles]);

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [userSelections, setUserSelections] = useState<
    Record<string, string | number>
  >(() => {
    if (!selectionsFromUrl) return {};
    try {
      const parsed = JSON.parse(selectionsFromUrl) as Record<string, unknown>;
      const result: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" || typeof v === "number") result[k] = v;
      }
      return result;
    } catch {
      return {};
    }
  });
  const [styleSkipResolved, setStyleSkipResolved] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  // Payload de la última generación disparada: permite reintentar desde
  // IAThanksStep sin volver al paso de upload.
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { generate } = useGenerateImage();
  const { refresh: refreshCredits } = useCredits();
  const { addToCart, removeItem } = useCart();

  useEffect(() => {
    if (!styleIdFromUrl) return;
    if (needsProductSelection || isLoadingStyles || isAuthLoading) return;
    if (styleSkipResolved) return;

    // Inicialización única desde deep-link: sincroniza la URL (style_id) y los
    // estilos cargados de forma asíncrona hacia el estado de navegación. No es
    // un render derivado, por eso el setState dentro del efecto es intencional.
    if (preselectedStyle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStyle(preselectedStyle);
      setStep((prev) => (prev === 1 ? (isAuthenticated ? 3 : 2) : prev));
    }
    setStyleSkipResolved(true);
  }, [
    styleIdFromUrl,
    needsProductSelection,
    isLoadingStyles,
    isAuthLoading,
    preselectedStyle,
    isAuthenticated,
    styleSkipResolved,
  ]);

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    const defaults: Record<string, string | number> = {};
    if (style.templateVarOptions) {
      for (const [key, opt] of Object.entries(style.templateVarOptions)) {
        if (opt.default !== undefined) defaults[key] = opt.default;
      }
    }
    setUserSelections(defaults);
  };

  const resolvedStyle: Style | null = useMemo(() => {
    if (selectedStyle && displayStyles.find((s) => s.id === selectedStyle.id)) {
      return selectedStyle;
    }
    return defaultStyle;
  }, [selectedStyle, displayStyles, defaultStyle]);

  // Deep-link resolution: when arriving via URL params, IAProductStep is skipped
  // so productInfo stays null. We resolve it here from productRefId + formatId.
  const [resolvedHandle, setResolvedHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!productRefIdFromUrl || productInfo) return;
    let cancelled = false;
    fetch(`${API_URL}/products/${productRefIdFromUrl}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data = "data" in json ? json.data : json;
        setResolvedHandle(
          (data as { shopifyHandle?: string })?.shopifyHandle ?? null,
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productRefIdFromUrl, productInfo]);

  const {
    formats: deepLinkFormats,
    product: deepLinkShopifyProduct,
    template: deepLinkTemplate,
  } = useFormatOptions(resolvedHandle);

  const effectiveProductInfo: SelectedProductInfo | null = useMemo(() => {
    if (productInfo) return productInfo;
    if (
      !formatIdFromUrl ||
      !deepLinkShopifyProduct ||
      deepLinkFormats.length === 0
    )
      return null;
    const f = deepLinkFormats.find((x) => x.formatId === formatIdFromUrl);
    if (!f) return null;
    const physicalSize = getFormatPhysicalSize(
      deepLinkShopifyProduct,
      f.shopifyVariantId,
    );
    return {
      shopifyVariantId: f.shopifyVariantId,
      price: f.price,
      currencyCode: f.currencyCode,
      productTitle: deepLinkShopifyProduct.title,
      productImage: deepLinkShopifyProduct.images.edges[0]?.node.url ?? "",
      formatLabel: f.displayName,
      template: deepLinkTemplate,
      formatWidth: physicalSize?.width ?? null,
      formatHeight: physicalSize?.height ?? null,
    };
  }, [
    productInfo,
    deepLinkFormats,
    deepLinkShopifyProduct,
    formatIdFromUrl,
    deepLinkTemplate,
  ]);

  // Reintenta la generación fallida con el mismo payload, sin salir de la
  // pantalla de "Thank you". Un nuevo generationId reinicia el polling.
  const handleRetry = async () => {
    if (!lastPayload) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const g = await generate(lastPayload);
      // La generación consumió 1 crédito: refrescamos el saldo del badge.
      void refreshCredits();

      // Producto físico: el item del carrito referenciaba el generationId que
      // falló. Lo reemplazamos por el nuevo (mismo variantId) para que checkout
      // y updateItemImage apunten a la generación buena. Digital/deep-link no
      // van al carrito, así que se omiten.
      const info = effectiveProductInfo;
      const isDigital = normalizeTemplate(info?.template) === "Digital";
      if (info && !isDigital) {
        removeItem(info.shopifyVariantId);
        addToCart({
          id: g.id,
          variantId: info.shopifyVariantId,
          name: info.productTitle,
          size: info.formatLabel,
          style: resolvedStyle?.name ?? undefined,
          price: parseFloat(info.price),
          quantity: 1,
          img: info.productImage,
          generationId: g.id,
        });
      }

      setGenerationId(g.id);
    } catch (err) {
      setRetryError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't retry. Please try again.",
      );
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="bg-white text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      <IAHeader step={step} />

      {needsProductSelection ? (
        <IAProductStep
          onSelect={(refId, fmtId, info) => {
            setPickedProductRefId(refId);
            setPickedFormatId(fmtId);
            setProductInfo(info);
          }}
        />
      ) : styleIdFromUrl && !styleSkipResolved ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : (
        <>
          {step === 1 && (
            <IAStyleStep
              styles={displayStyles}
              selectedStyle={resolvedStyle}
              onStyleSelect={handleStyleSelect}
              onBack={undefined}
              onNext={() => setStep(isAuthenticated ? 3 : 2)}
              isLoading={isLoadingStyles}
              error={stylesError}
              isFiltered={isFiltered}
              userSelections={userSelections}
              onSelectionsChange={(key, val) =>
                setUserSelections((prev) => ({ ...prev, [key]: val }))
              }
            />
          )}

          {step === 2 && <IALeadStep onComplete={() => setStep(3)} />}

          {step === 3 && (
            <IAUploadStep
              photos={photos}
              onPhotosChange={setPhotos}
              styleId={resolvedStyle?.id ?? null}
              productRefId={productRefId}
              formatId={formatId}
              onNext={(genId, payload) => {
                setGenerationId(genId);
                setLastPayload(payload);
                setStep(4);
              }}
              productInfo={effectiveProductInfo}
              styleName={resolvedStyle?.name ?? null}
              userSelections={userSelections}
            />
          )}

          {step === 4 && (
            <IAThanksStep
              generationId={generationId}
              productImage={effectiveProductInfo?.productImage}
              formatWidth={effectiveProductInfo?.formatWidth}
              formatHeight={effectiveProductInfo?.formatHeight}
              template={effectiveProductInfo?.template}
              onRetry={lastPayload ? handleRetry : undefined}
              retrying={retrying}
              retryError={retryError}
            />
          )}
        </>
      )}
    </div>
  );
}

// Componente principal de la página que utiliza Suspense para el manejo de carga diferida (Query Params)
export default function IAGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      }
    >
      <IAGeneratorContent />
    </Suspense>
  );
}
