"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IAHeader, IAUploadStep, IAStyleStep, IALeadStep, IAPreviewStep } from "@/widgets/ia-generator";
import { styles } from "@/entities/art-style/model/styles";
import { productsList } from "@/entities/pet-product/model/products";
import { FormatOption } from "@/hooks/useFormatOptions";

function IAGeneratorContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productRefIdFromUrl = searchParams.get("product_ref_id");
  const formatIdFromUrl = searchParams.get("format_id");

  // Find pre-selected product name from URL param
  const preSelectedProduct = productsList.find(
    (p) => p.productRefId === productRefIdFromUrl,
  );

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("Classic Oil");
  const [selectedProduct, setSelectedProduct] = useState(
    preSelectedProduct?.name ?? "Framed Painting",
  );
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Reset format selection when product changes
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

      {/* STEP 1: UPLOAD & PET DETAILS */}
      {step === 1 && (
        <IAUploadStep
          photos={photos}
          onPhotosChange={setPhotos}
          selectedPetId={selectedPetId}
          onPetSelect={setSelectedPetId}
          onNext={() => setStep(2)}
        />
      )}

      {/* STEP 2: CHOOSE ART STYLE (filtered by product+format if coming from product page) */}
      {step === 2 && (
        <IAStyleStep
          styles={styles}
          selectedStyle={selectedStyle}
          onStyleSelect={setSelectedStyle}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          productRefId={productRefIdFromUrl}
          formatId={formatIdFromUrl}
        />
      )}

      {/* STEP 3: LEAD CAPTURE */}
      {step === 3 && <IALeadStep onComplete={() => setStep(4)} />}

      {/* STEP 4: PREVIEW & PRODUCT + FORMAT SELECTION */}
      {step === 4 && (
        <IAPreviewStep
          products={productsList}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
          selectedFormat={selectedFormat}
          onFormatSelect={setSelectedFormat}
          preSelectedFormatId={formatIdFromUrl}
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
