"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// Componentes visuales organizados por pasos del generador
import {
  IAHeader,
  IAUploadStep,
  IAStyleStep,
  IALeadStep,
  IAPreviewStep,
} from "@/widgets/ia-generator";

// Modelos y hooks personalizados para manejar la lógica de negocio, estilos y productos
import { Style } from "@/entities/art-style/model/styles";
import { FormatOption } from "@/hooks/useFormatOptions";
import { useCompatStyles } from "@/hooks/useCompatStyles";
import { useBackendProducts } from "@/hooks/useBackendProducts";
import { useAllStyles } from "@/hooks/useAllStyles";
import { GenerationStatus } from "@/hooks/useGenerationStatus";

function IAGeneratorContent() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  // Obtención de parámetros de la URL para pre-filtrar productos y formatos
  const productRefIdFromUrl = searchParams.get("product_ref_id");
  const formatIdFromUrl = searchParams.get("format_id");
  const isFiltered = !!(productRefIdFromUrl && formatIdFromUrl);

  // Hook para obtener la lista de productos disponibles desde el backend
  const {
    products: backendProducts,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useBackendProducts();

  // Hook para obtener todos los estilos artísticos disponibles
  const {
    styles: allStyles,
    isLoading: isLoadingAllStyles,
    error: allStylesError,
  } = useAllStyles();

  // Hook para obtener solo los estilos compatibles con un producto/formato específico
  const {
    styles: compatStyles,
    isLoading: isLoadingCompatStyles,
    error: compatStylesError,
  } = useCompatStyles(productRefIdFromUrl, formatIdFromUrl);

  // Lógica para decidir qué estilos mostrar basándose en si hay filtros aplicados
  const isLoadingStyles = isFiltered
    ? isLoadingCompatStyles
    : isLoadingAllStyles;
  const stylesError = isFiltered ? compatStylesError : allStylesError;
  const displayStyles: Style[] = isFiltered ? compatStyles : allStyles;

  // Determina el nombre del producto por defecto basándose en la URL o el primer producto disponible
  const defaultProduct = useMemo(() => {
    if (productRefIdFromUrl) {
      const match = backendProducts.find(
        (p) => p.productRefId === productRefIdFromUrl,
      );
      if (match) return match.name;
    }
    return backendProducts[0]?.name ?? "";
  }, [backendProducts, productRefIdFromUrl]);

  // Determina el estilo por defecto (el primero de la lista actual)
  const defaultStyle: Style | null = useMemo(() => {
    if (isLoadingStyles) return null;
    return displayStyles[0] ?? null;
  }, [displayStyles, isLoadingStyles]);

  // Estados locales para controlar el flujo de pasos, archivos de fotos y selecciones del usuario
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(
    null,
  );

  // Estados para almacenar información de la mascota una vez procesada la carga de fotos
  const [petId, setPetId] = useState<string | null>(null);
  const [petPhotoId, setPetPhotoId] = useState<string | null>(null);
  const [petPhotoUrl, setPetPhotoUrl] = useState<string | null>(null);

  // Estado que maneja el progreso de la generación de la IA
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");

  const resolvedProduct = selectedProduct || defaultProduct;

  // Lógica para mantener el estilo seleccionado o volver al valor por defecto si cambia la lista
  const resolvedStyle: Style | null = useMemo(() => {
    if (selectedStyle && displayStyles.find((s) => s.id === selectedStyle.id)) {
      return selectedStyle;
    }
    return defaultStyle;
  }, [selectedStyle, displayStyles, defaultStyle]);

  // Manejador para la selección de producto que resetea el formato elegido
  function handleProductSelect(name: string) {
    setSelectedProduct(name);
    setSelectedFormat(null);
  }

  return (
    <div className="bg-cream text-slate-dark font-body min-h-screen flex flex-col transition-all duration-500">
      {/* Cabecera del generador que muestra el progreso según el paso actual */}
      <IAHeader step={step} generationStatus={generationStatus} />

      {/* PASO 1: Selección del estilo artístico */}
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

      {/* PASO 2: Captura de datos del cliente (Lead) para usuarios no autenticados */}
      {step === 2 && <IALeadStep onComplete={() => setStep(3)} />}

      {/* PASO 3: Carga de fotos de la mascota y preparación de datos */}
      {step === 3 && (
        <IAUploadStep
          photos={photos}
          onPhotosChange={setPhotos}
          onPetReady={({
            petId: pid,
            petPhotoId: phId,
            petPhotoUrl: phUrl,
          }) => {
            setPetId(pid);
            setPetPhotoId(phId);
            setPetPhotoUrl(phUrl);
          }}
          onNext={() => setStep(4)}
        />
      )}

      {/* PASO 4: Vista previa final, selección de producto/formato y detonación de la generación IA */}
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
          petId={petId}
          petPhotoId={petPhotoId}
          petPhotoUrl={petPhotoUrl}
          styleId={resolvedStyle?.id ?? null}
          onGenerationStatusChange={setGenerationStatus}
        />
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
