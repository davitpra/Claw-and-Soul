"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IAHeader, IAUploadStep, IAStyleStep, IALeadStep, IAPreviewStep } from "@/widgets/ia-generator";
import { styles } from "@/entities/art-style/model/styles";
import { productsList } from "@/entities/pet-product/model/products";
import { FormatOption } from "@/hooks/useFormatOptions";

export default function IAGeneratorPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("Classic Oil");
  const [selectedProduct, setSelectedProduct] = useState("Framed Painting");
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

      {/* STEP 2: CHOOSE ART STYLE */}
      {step === 2 && (
        <IAStyleStep
          styles={styles}
          selectedStyle={selectedStyle}
          onStyleSelect={setSelectedStyle}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
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
        />
      )}
    </div>
  );
}
