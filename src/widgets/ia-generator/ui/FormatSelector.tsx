"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FormatOption, ShopifyProduct } from "@/hooks/useFormatOptions";

interface FormatSelectorProps {
  product: ShopifyProduct | null;
  formats: FormatOption[];
  selectedFormatId: string | null;
  onFormatSelect: (format: FormatOption | null) => void;
  isLoading: boolean;
  error: string | null;
}

export function FormatSelector({
  product,
  formats,
  selectedFormatId,
  onFormatSelect,
  isLoading,
  error,
}: FormatSelectorProps) {
  const variants = product?.variants.edges ?? [];
  const optionNames =
    variants[0]?.node.selectedOptions.map((o) => o.name) ?? [];

  const optionValues: Record<string, string[]> = {};
  optionNames.forEach((name) => {
    optionValues[name] = [
      ...new Set(
        variants
          .map((v) => v.node.selectedOptions.find((o) => o.name === name)?.value)
          .filter(Boolean) as string[],
      ),
    ];
  });

  const getOptionsFromVariantId = (variantId: string | null) => {
    const v = variants.find((e) => e.node.id === variantId);
    const result: Record<string, string> = {};
    v?.node.selectedOptions.forEach((o) => {
      result[o.name] = o.value;
    });
    return result;
  };

  const initOptions = (): Record<string, string> => {
    if (selectedFormatId) {
      const f = formats.find((x) => x.formatId === selectedFormatId);
      if (f) {
        const opts = getOptionsFromVariantId(f.shopifyVariantId);
        if (Object.keys(opts).length > 0) return opts;
      }
    }
    const firstVariant = variants[0]?.node;
    if (!firstVariant) return {};
    return Object.fromEntries(
      firstVariant.selectedOptions.map((o) => [o.name, o.value]),
    );
  };

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initOptions);

  // Re-initialize when the product changes (new product selected in IAProductStep)
  useEffect(() => {
    if (variants.length === 0) return;
    const opts = initOptions();
    setSelectedOptions(opts);

    const matchingVariant = variants.find((e) =>
      e.node.selectedOptions.every((o) => opts[o.name] === o.value),
    );
    const format =
      formats.find((f) => f.shopifyVariantId === matchingVariant?.node.id) ?? null;
    onFormatSelect(format);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const matchingVariant = variants.find((e) =>
      e.node.selectedOptions.every((o) => newOptions[o.name] === o.value),
    );
    const format =
      formats.find((f) => f.shopifyVariantId === matchingVariant?.node.id) ?? null;
    onFormatSelect(format);
  };

  const currentVariant = variants.find((e) =>
    e.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
  );
  const currentFormat = formats.find(
    (f) => f.shopifyVariantId === currentVariant?.node.id,
  ) ?? null;
  const isNotPersonalizable =
    currentVariant !== undefined && currentFormat === null;

  if (isLoading) {
    return <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        <span className="material-symbols-outlined text-lg">error</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!product || variants.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
        <span className="material-symbols-outlined text-lg">info</span>
        <span>No available sizes for this product right now.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {optionNames.map((optionName) => (
        <div
          key={optionName}
          className="flex items-center border border-primary/40 rounded-lg overflow-hidden"
        >
          <div className="bg-primary/10 px-4 py-3 min-w-24 border-r border-primary/40">
            <span className="font-bold text-primary uppercase tracking-widest">
              {optionName}
            </span>
          </div>
          <div className="relative flex-1">
            <select
              value={selectedOptions[optionName] ?? ""}
              onChange={(e) => handleOptionChange(optionName, e.target.value)}
              className="w-full appearance-none bg-white px-4 py-3 pr-10 font-medium text-text-main focus:outline-none cursor-pointer"
            >
              {optionValues[optionName]?.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
          </div>
        </div>
      ))}

      {isNotPersonalizable && (
        <div className="flex items-center gap-2 mt-1 px-1 text-sm text-amber-600">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Esta variante no está disponible para personalización.</span>
        </div>
      )}
    </div>
  );
}
