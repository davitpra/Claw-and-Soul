"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/shopify";
import { useFormatOptions } from "@/hooks/useFormatOptions";
import { FormatSelector } from "./FormatSelector";
import { StepNavigation } from "./StepNavigation";
import { Container } from "@/shared/ui/Container";
import { FormatOption } from "@/hooks/useFormatOptions";

interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  image: string;
  price: string;
}

interface IAProductStepProps {
  onSelect: (productRefId: string, formatId: string) => void;
}

export function IAProductStep({ onSelect }: IAProductStepProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(
    null,
  );

  const {
    productRefId,
    formats,
    product,
    isLoading: isLoadingFormats,
    error: formatsError,
  } = useFormatOptions(selectedHandle);

  useEffect(() => {
    getProducts(20)
      .then((items) => {
        const mapped: CatalogProduct[] = items.map((p) => {
          const price = p.priceRange?.minVariantPrice || {
            amount: "0.00",
            currencyCode: "USD",
          };
          const symbol =
            price.currencyCode === "USD" ? "$" : price.currencyCode;
          return {
            id: p.id,
            handle: p.handle,
            title: p.title,
            image: p.images.edges[0]?.node.url || "/placeholder-image.jpg",
            price: `${symbol}${parseFloat(price.amount).toFixed(2)}`,
          };
        });
        setProducts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleProductSelect = (handle: string) => {
    setSelectedHandle(handle);
    setSelectedFormat(null);
  };

  const handleContinue = () => {
    if (productRefId && selectedFormat) {
      onSelect(productRefId, selectedFormat.formatId);
    }
  };

  const canContinue = !!(productRefId && selectedFormat && !isLoadingFormats);

  return (
    <Container
      as="main"
      className="grow py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col justify-center md:flex-row md:justify-between gap-4 md:gap-0 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
            Choose your product
          </h1>
          <p className="text-slate-dark/70 text-lg">
            Select the product you want to personalize with your pet.
          </p>
        </div>
        <div className="self-center md:self-auto">
          <StepNavigation
            onNext={handleContinue}
            nextLabel="Continue"
            disableNext={!canContinue}
          />
        </div>
      </div>

      {loadingProducts ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-slate-dark/60 font-semibold">
          No products found in your Shopify store.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 items-start">
          {products.map((catalogProduct) => {
            const isSelected = selectedHandle === catalogProduct.handle;
            return (
              <div key={catalogProduct.id} className="flex flex-col gap-4">
                <button
                  onClick={() => handleProductSelect(catalogProduct.handle)}
                  className="group flex flex-col gap-4 text-left"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-slate-dark text-center line-clamp-1 font-display">
                      {catalogProduct.title}
                    </h3>
                  </div>
                  <div
                    className={`relative overflow-hidden bg-white shadow-sm border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-transparent"
                    }`}
                  >
                    <div
                      className="aspect-4/5 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${catalogProduct.image}')` }}
                    />
                    {isSelected && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                </button>

                {isSelected && (
                  <FormatSelector
                    product={product}
                    formats={formats}
                    selectedFormatId={selectedFormat?.formatId ?? null}
                    onFormatSelect={setSelectedFormat}
                    isLoading={isLoadingFormats}
                    error={formatsError}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}
