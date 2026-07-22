"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import OptionChips from "@/shared/ui/OptionChips";

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

  // `set` nunca se expone; `size` lo renderiza ProductSizeSelector.
  const visibleOptionNames = optionNames.filter(
    (n) => n.toLowerCase() !== "set" && n.toLowerCase() !== "size",
  );

  if (variants.length <= 1 || visibleOptionNames.length === 0) return null;

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
    <div className="flex flex-col gap-6">
      {visibleOptionNames.map((optionName) => (
        <OptionChips
          key={optionName}
          name={`variant-${optionName}`}
          label={optionName}
          value={selectedOptions[optionName] || ""}
          options={optionValues[optionName].map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => handleOptionChange(optionName, value)}
          fill
        />
      ))}
    </div>
  );
}
