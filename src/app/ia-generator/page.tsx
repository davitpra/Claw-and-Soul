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
} from "@/widgets/ia-generator";

import { Style } from "@/entities/art-style/model/styles";
import { useCompatStyles } from "@/hooks/useCompatStyles";
import { useAllStyles } from "@/hooks/useAllStyles";

function IAGeneratorContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const productRefIdFromUrl = searchParams.get("product_ref_id");
  const formatIdFromUrl = searchParams.get("format_id");
  const styleIdFromUrl = searchParams.get("style_id");

  const [pickedProductRefId, setPickedProductRefId] = useState<string | null>(null);
  const [pickedFormatId, setPickedFormatId] = useState<string | null>(null);

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
  const [styleSkipResolved, setStyleSkipResolved] = useState(false);

  useEffect(() => {
    if (!styleIdFromUrl) {
      setStyleSkipResolved(true);
      return;
    }
    if (needsProductSelection || isLoadingStyles || isAuthLoading) return;
    if (styleSkipResolved) return;

    if (preselectedStyle) {
      setSelectedStyle(preselectedStyle);
      setStep((prev) => (prev === 1 ? (isAuthenticated ? 3 : 2) : prev));
    }
    setStyleSkipResolved(true);
  }, [styleIdFromUrl, needsProductSelection, isLoadingStyles, isAuthLoading,
      preselectedStyle, isAuthenticated, styleSkipResolved]);

  const resolvedStyle: Style | null = useMemo(() => {
    if (selectedStyle && displayStyles.find((s) => s.id === selectedStyle.id)) {
      return selectedStyle;
    }
    return defaultStyle;
  }, [selectedStyle, displayStyles, defaultStyle]);

  return (
    <div className="bg-white text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      <IAHeader step={step} />

      {needsProductSelection ? (
        <IAProductStep
          onSelect={(refId, fmtId) => {
            setPickedProductRefId(refId);
            setPickedFormatId(fmtId);
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
              onStyleSelect={setSelectedStyle}
              onBack={undefined}
              onNext={() => setStep(isAuthenticated ? 3 : 2)}
              isLoading={isLoadingStyles}
              error={stylesError}
              isFiltered={isFiltered}
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
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && <IAThanksStep thanksUrl={resolvedStyle?.thanksUrl} />}
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
