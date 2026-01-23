"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShopifyProduct } from "@/lib/shopify";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductVariantSelectorProps {
  product: ShopifyProduct;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
}

export default function ProductVariantSelector({
  product,
  selectedVariantId,
  onVariantChange,
}: ProductVariantSelectorProps) {
  const variants = product.variants.edges;
  console.log(variants);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lógica de Agrupación:
  // Identifica la primera opción que tiene múltiples valores para usarla como grupo primario
  const optionNames =
    variants[0]?.node.selectedOptions.map((o) => o.name) || [];

  const groupingOptionName =
    optionNames.find((name) => {
      const values = new Set(
        variants.map(
          (v) => v.node.selectedOptions.find((o) => o.name === name)?.value
        )
      );
      return values.size > 1;
    }) || optionNames[0];

  // Organiza las variantes en un objeto usando el valor de la opción de agrupación como clave
  const groupedVariants: Record<string, typeof variants> = {};
  variants.forEach((v) => {
    const groupValue =
      v.node.selectedOptions.find((o) => o.name === groupingOptionName)
        ?.value || "Default";
    if (!groupedVariants[groupValue]) groupedVariants[groupValue] = [];
    groupedVariants[groupValue].push(v);
  });

  const groupNames = Object.keys(groupedVariants);

  // Estado para controlar qué grupo de variantes se está visualizando actualmente
  const [activeGroup, setActiveGroup] = useState<string>(() => {
    const initialVariant = variants.find(
      (v) => v.node.id === selectedVariantId
    );
    return (
      initialVariant?.node.selectedOptions.find(
        (o) => o.name === groupingOptionName
      )?.value || groupNames[0]
    );
  });

  // Sincroniza el grupo activo si la variante seleccionada cambia externamente
  useEffect(() => {
    const currentVariant = variants.find(
      (v) => v.node.id === selectedVariantId
    );
    const variantGroup = currentVariant?.node.selectedOptions.find(
      (o) => o.name === groupingOptionName
    )?.value;
    if (variantGroup && variantGroup !== activeGroup) {
      setActiveGroup(variantGroup);
    }
  }, [selectedVariantId, groupingOptionName, variants]);

  // Si el producto no tiene variantes suficientes para elegir, no renderizamos nada
  if (variants.length <= 1) return null;

  // Variantes que pertenecen al grupo seleccionado actualmente
  const currentGroupItems = groupedVariants[activeGroup] || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        const style = window.getComputedStyle(container);
        const gap = parseInt(style.columnGap) || 16;
        const scrollAmount = firstChild.offsetWidth + gap;

        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-text-main/5 pb-4">
        <span className="text-sm font-black text-text-main uppercase tracking-[0.2em]">
          Customize Your Product
        </span>
        <span className="text-[10px] font-bold text-text-muted/60 uppercase">
          {variants.length} Variants
        </span>
      </div>

      <div className="flex flex-col gap-8">
        {/* Step 1: Selector de Tipo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">
              Step 1: Select {groupingOptionName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groupNames.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setActiveGroup(name);
                  // Seleccionamos automáticamente la primera variante disponible de este grupo
                  const firstInGroup =
                    groupedVariants[name].find(
                      (v) => v.node.availableForSale
                    ) || groupedVariants[name][0];
                  if (firstInGroup) {
                    onVariantChange(firstInGroup.node.id);
                  }
                }}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  activeGroup === name
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                    : "border-text-main/5 bg-white text-text-main hover:border-primary/30"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Carrusel de Opciones */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">
                Step 2: Choose {variants[0]?.node.selectedOptions[1].name}
              </span>
              <div className="h-px w-24 bg-gradient-to-r from-text-main/10 to-transparent lg:block hidden"></div>
            </div>

            {/* Navegación del Carrusel */}
            {currentGroupItems.length > 3 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="w-10 h-10 rounded-full bg-white border border-text-main/5 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-10 h-10 rounded-full bg-white border border-text-main/5 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative group/carousel">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar pb-4 pr-12 lg:pr-0 "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {currentGroupItems.map(({ node: variant }) => {
                const isSelected = selectedVariantId === variant.id;
                const isAvailable = variant.availableForSale;

                const displayOptions = variant.selectedOptions.filter(
                  (o) => o.name !== groupingOptionName
                );

                return (
                  <button
                    key={variant.id}
                    onClick={() => isAvailable && onVariantChange(variant.id)}
                    disabled={!isAvailable}
                    className={`
                      flex-shrink-0 w-44 md:w-56 lg:w-32 snap-start
                      group relative flex flex-col items-center gap-4 p-4 rounded-3xl border-2 transition-all duration-300 text-center m-1
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20 scale-[1.02]"
                          : "border-text-main/10 bg-white hover:border-primary/40 hover:shadow-md"
                      }
                      ${
                        !isAvailable
                          ? "opacity-50 cursor-not-allowed grayscale"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    {/* Variant Image */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-background-light border border-text-main/5 group-hover:shadow-inner">
                      {variant.image ? (
                        <Image
                          src={variant.image.url}
                          alt={variant.image.altText || variant.title}
                          fill
                          sizes="(max-width: 768px) 176px, 224px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted/20">
                          <span className="material-symbols-outlined text-4xl">
                            image
                          </span>
                        </div>
                      )}

                      {/* Selected Badge Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl animate-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-white text-[20px] font-bold">
                              check
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variant Info */}
                    <div className="flex flex-col items-center w-full min-w-0">
                      <span className="font-bold text-text-main truncate text-xs uppercase tracking-wider mb-1">
                        {displayOptions.length > 0
                          ? displayOptions.map((o) => o.value).join(" / ")
                          : variant.title}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-black ${
                            isSelected ? "text-primary" : "text-text-main"
                          }`}
                        >
                          {variant.price.currencyCode === "USD" ? "$" : ""}
                          {parseFloat(variant.price.amount).toFixed(2)}
                        </span>
                      </div>

                      {/* Status */}
                      {!isAvailable && (
                        <span className="text-[10px] text-red-500 font-bold uppercase mt-2 px-2 py-0.5 bg-red-50 rounded-full">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
