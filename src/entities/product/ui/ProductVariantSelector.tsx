"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { ChevronDown } from "lucide-react";

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

  const optionNames =
    variants[0]?.node.selectedOptions.map((o) => o.name) || [];

  const optionValues: Record<string, string[]> = {};
  optionNames.forEach((name) => {
    optionValues[name] = [
      ...new Set(
        variants
          .map(
            (v) => v.node.selectedOptions.find((o) => o.name === name)?.value,
          )
          .filter(Boolean) as string[],
      ),
    ];
  });

  const getOptionsFromVariant = (variantId: string) => {
    const variant = variants.find((v) => v.node.id === variantId);
    const result: Record<string, string> = {};
    variant?.node.selectedOptions.forEach((o) => {
      result[o.name] = o.value;
    });
    return result;
  };

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(
    () =>
      getOptionsFromVariant(selectedVariantId) ||
      Object.fromEntries(
        optionNames.map((name) => [name, optionValues[name][0]]),
      ),
  );

  useEffect(() => {
    const options = getOptionsFromVariant(selectedVariantId);
    if (Object.keys(options).length > 0) {
      setSelectedOptions(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantId]);

  if (variants.length <= 1) return null;

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const matchingVariant = variants.find((v) =>
      v.node.selectedOptions.every((o) => newOptions[o.name] === o.value),
    );

    if (matchingVariant) {
      onVariantChange(matchingVariant.node.id);
    }
  };

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
              value={selectedOptions[optionName] || ""}
              onChange={(e) => handleOptionChange(optionName, e.target.value)}
              className="w-full appearance-none bg-white px-4 py-3 pr-10 font-medium text-text-main focus:outline-none cursor-pointer"
            >
              {optionValues[optionName].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
