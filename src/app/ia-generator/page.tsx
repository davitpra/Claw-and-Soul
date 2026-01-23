"use client";

import { useState } from "react";
import { IAHeader, IAStep1, IAStep2, IAStep3 } from "@/widgets/ia-generator";
import { styles } from "@/entities/art-style/model/styles";
import { productsList } from "@/entities/pet-product/model/products";

export default function IAGeneratorPage() {
  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState("Classic Oil");
  const [hasFile, setHasFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("Framed Painting");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setHasFile(true);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="bg-cream text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      <IAHeader step={step} />

      {/* STEP 1: UPLOAD & STYLE */}
      {step === 1 && (
        <IAStep1
          hasFile={hasFile}
          previewUrl={previewUrl}
          onFileChange={handleFileChange}
          styles={styles}
          selectedStyle={selectedStyle}
          onStyleSelect={setSelectedStyle}
          onNext={() => setStep(2)}
        />
      )}

      {/* STEP 2: LEAD CAPTURE / PROCESSING */}
      {step === 2 && <IAStep2 onComplete={() => setStep(3)} />}

      {/* STEP 3: PREVIEW & PRODUCT */}
      {step === 3 && (
        <IAStep3
          products={productsList}
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
        />
      )}
    </div>
  );
}
