"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  IAHeader,
  IAUploadStep,
  IAStyleStep,
  IALeadStep,
  IAPreviewStep,
} from "@/widgets/ia-generator";
import { Style } from "@/entities/art-style/model/styles";
import { FormatOption } from "@/hooks/useFormatOptions";
import { useCompatStyles } from "@/hooks/useCompatStyles";
import { useBackendProducts } from "@/hooks/useBackendProducts";
import { useAllStyles } from "@/hooks/useAllStyles";

function IAGeneratorContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productRefIdFromUrl = searchParams.get("product_ref_id");
  const formatIdFromUrl = searchParams.get("format_id");
  const isFiltered = !!(productRefIdFromUrl && formatIdFromUrl);

  const {
    products: backendProducts,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useBackendProducts();

  const {
    styles: allStyles,
    isLoading: isLoadingAllStyles,
    error: allStylesError,
  } = useAllStyles();

  const {
    styles: compatStyles,
    isLoading: isLoadingCompatStyles,
    error: compatStylesError,
  } = useCompatStyles(productRefIdFromUrl, formatIdFromUrl);

  const isLoadingStyles = isFiltered ? isLoadingCompatStyles : isLoadingAllStyles;
  const stylesError = isFiltered ? compatStylesError : allStylesError;
  const displayStyles: Style[] = isFiltered ? compatStyles : allStyles;

  // Derived: the product name to pre-select (from URL or first product loaded)
  const defaultProduct = useMemo(() => {
    if (productRefIdFromUrl) {
      const match = backendProducts.find(
        (p) => p.productRefId === productRefIdFromUrl,
      );
      if (match) return match.name;
    }
    return backendProducts[0]?.name ?? "";
  }, [backendProducts, productRefIdFromUrl]);

  // Derived: the first compatible style to pre-select once loaded
  const defaultStyle: Style | null = useMemo(() => {
    if (isLoadingStyles) return null;
    return displayStyles[0] ?? null;
  }, [displayStyles, isLoadingStyles]);

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(
    null,
  );

  // Sync selectedProduct when backend products arrive or URL param changes
  const resolvedProduct = selectedProduct || defaultProduct;

  // Sync selectedStyle: use user pick if it exists in the current list, else fall back to default
  const resolvedStyle: Style | null = useMemo(() => {
    if (
      selectedStyle &&
      displayStyles.find((s) => s.name === selectedStyle.name)
    ) {
      return selectedStyle;
    }
    return defaultStyle;
  }, [selectedStyle, displayStyles, defaultStyle]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  function handleProductSelect(name: string) {
    setSelectedProduct(name);
    setSelectedFormat(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-cream text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      <IAHeader step={step} />

      {step === 1 && (
        <IAStyleStep
          styles={displayStyles}
          selectedStyle={resolvedStyle}
          onStyleSelect={setSelectedStyle}
          onBack={undefined}
          onNext={() => setStep(2)}
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
          selectedPetId={selectedPetId}
          onPetSelect={setSelectedPetId}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <IAPreviewStep
          products={backendProducts}
          selectedProduct={resolvedProduct}
          onProductSelect={handleProductSelect}
          selectedFormat={selectedFormat}
          onFormatSelect={setSelectedFormat}
          preSelectedFormatId={formatIdFromUrl}
          isLoadingProducts={isLoadingProducts}
          productsError={productsError}
        />
      )}
    </div>
  );
}

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
