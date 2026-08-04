"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  IAHeader,
  IAUploadStep,
  IALeadStep,
  IAThanksStep,
  IAStartFromProduct,
  type SelectedProductInfo,
} from "@/widgets/ia-generator";

import { getFormatPhysicalSize } from "@/entities/product/lib/formatPhysicalSize";
import { normalizeTemplate } from "@/entities/product/lib/template";
import { useStyle } from "@/hooks/useStyle";
import { useFormatOptions } from "@/hooks/useFormatOptions";
import { useGenerateImage, type GeneratePayload } from "@/hooks/useGenerateImage";
import { useCredits } from "@/hooks/useCredits";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const PRODUCT_LOAD_ERROR =
  "We couldn't load this product. Please pick it again from the catalog.";

// Pasos visibles del generador. El producto, el formato y el estilo ya vienen
// resueltos desde la ficha de producto, así que aquí solo queda la sesión, la
// foto y el resultado.
const STEP_LEAD = 1;
const STEP_UPLOAD = 2;
const STEP_THANKS = 3;

function IAGeneratorContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const productRefId = searchParams.get("product_ref_id");
  const formatId = searchParams.get("format_id");
  const styleId = searchParams.get("style_id");
  const selectionsFromUrl = searchParams.get("selections");

  // El generador es una ruta de continuación: sin el contexto completo del
  // producto no hay nada que generar y no se dispara ningún fetch.
  const hasProductContext = !!(productRefId && formatId && styleId);

  const {
    style,
    isLoading: isLoadingStyle,
    error: styleError,
  } = useStyle(hasProductContext ? styleId : null);

  const [step, setStep] = useState(STEP_LEAD);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  // Payload de la última generación disparada: permite reintentar desde
  // IAThanksStep sin volver al paso de upload.
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const { generate } = useGenerateImage();
  const { refresh: refreshCredits } = useCredits();
  const { addToCart, removeItem } = useCart();

  // Con sesión abierta el paso de login sobra. Se decide una sola vez, cuando
  // el estado de auth ya resolvió: así un refresh de token a mitad del upload
  // no devuelve al usuario al login y le borra las fotos cargadas.
  useEffect(() => {
    if (bootstrapped || isAuthLoading) return;
    if (isAuthenticated) setStep(STEP_UPLOAD);
    setBootstrapped(true);
  }, [bootstrapped, isAuthLoading, isAuthenticated]);

  // Las opciones del estilo (`templateVarOptions`) se eligen en la ficha del
  // producto y llegan serializadas en `selections`. Si la URL no las trae —una
  // URL armada a mano—, se cae a los valores por defecto del estilo.
  const userSelections = useMemo<Record<string, string | number>>(() => {
    if (selectionsFromUrl) {
      try {
        const parsed = JSON.parse(selectionsFromUrl) as Record<string, unknown>;
        const result: Record<string, string | number> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "string" || typeof v === "number") result[k] = v;
        }
        if (Object.keys(result).length > 0) return result;
      } catch {
        // Selections inválidas: se ignoran y se usan los defaults del estilo.
      }
    }
    const defaults: Record<string, string | number> = {};
    if (style?.templateVarOptions) {
      for (const [key, opt] of Object.entries(style.templateVarOptions)) {
        if (opt.default !== undefined) defaults[key] = opt.default;
      }
    }
    return defaults;
  }, [selectionsFromUrl, style]);

  // El deep-link trae el id interno del producto; para leer precio, imagen y
  // tamaño físico hace falta el handle de Shopify.
  const [resolvedHandle, setResolvedHandle] = useState<string | null>(null);
  const [productLookupError, setProductLookupError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!hasProductContext) return;
    let cancelled = false;
    fetch(`${API_URL}/products/${productRefId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data = "data" in json ? json.data : json;
        const handle = (data as { shopifyHandle?: string })?.shopifyHandle;
        if (handle) setResolvedHandle(handle);
        else setProductLookupError(PRODUCT_LOAD_ERROR);
      })
      .catch(() => {
        if (!cancelled) setProductLookupError(PRODUCT_LOAD_ERROR);
      });
    return () => {
      cancelled = true;
    };
  }, [hasProductContext, productRefId]);

  const {
    formats,
    product: shopifyProduct,
    template,
    isLoading: isLoadingFormats,
    error: formatsError,
  } = useFormatOptions(resolvedHandle);

  const productInfo: SelectedProductInfo | null = useMemo(() => {
    if (!formatId || !shopifyProduct || formats.length === 0) return null;
    const f = formats.find((x) => x.formatId === formatId);
    if (!f) return null;
    const physicalSize = getFormatPhysicalSize(
      shopifyProduct,
      f.shopifyVariantId,
    );
    return {
      shopifyVariantId: f.shopifyVariantId,
      price: f.price,
      currencyCode: f.currencyCode,
      productTitle: shopifyProduct.title,
      productImage: shopifyProduct.images.edges[0]?.node.url ?? "",
      formatLabel: f.displayName,
      template,
      formatWidth: physicalSize?.width ?? null,
      formatHeight: physicalSize?.height ?? null,
    };
  }, [formats, shopifyProduct, formatId, template]);

  // El paso de upload solo se muestra con `productInfo` ya resuelto: si se
  // enviara antes, `usePetUploadForm` no tendría variante y el producto físico
  // nunca entraría al carrito.
  const isResolvingProduct =
    !productLookupError && (!resolvedHandle || isLoadingFormats);

  const productError =
    productLookupError ??
    formatsError ??
    (!isResolvingProduct && !productInfo ? PRODUCT_LOAD_ERROR : null);

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
      // y updateItemImage apunten a la generación buena. Digital no va al
      // carrito, así que se omite.
      const isDigital = normalizeTemplate(productInfo?.template) === "Digital";
      if (productInfo && !isDigital) {
        removeItem(productInfo.shopifyVariantId);
        addToCart({
          id: g.id,
          variantId: productInfo.shopifyVariantId,
          name: productInfo.productTitle,
          size: productInfo.formatLabel,
          style: style?.name ?? undefined,
          price: parseFloat(productInfo.price),
          quantity: 1,
          img: productInfo.productImage,
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

  const isBootstrapping =
    !bootstrapped || isLoadingStyle || isResolvingProduct || !productInfo;

  return (
    <div className="bg-white text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      <IAHeader step={hasProductContext ? step : 0} />

      {!hasProductContext ? (
        <IAStartFromProduct />
      ) : productError || styleError ? (
        <IAStartFromProduct message={productError ?? styleError ?? undefined} />
      ) : isBootstrapping ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : (
        <>
          {step === STEP_LEAD && (
            <IALeadStep onComplete={() => setStep(STEP_UPLOAD)} />
          )}

          {step === STEP_UPLOAD && (
            <IAUploadStep
              photos={photos}
              onPhotosChange={setPhotos}
              styleId={styleId}
              productRefId={productRefId}
              formatId={formatId}
              onNext={(genId, payload) => {
                setGenerationId(genId);
                setLastPayload(payload);
                setStep(STEP_THANKS);
              }}
              productInfo={productInfo}
              styleName={style?.name ?? null}
              userSelections={userSelections}
            />
          )}

          {step === STEP_THANKS && (
            <IAThanksStep
              generationId={generationId}
              productImage={productInfo.productImage}
              formatWidth={productInfo.formatWidth}
              formatHeight={productInfo.formatHeight}
              template={productInfo.template}
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
