"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Banner,
  Spinner,
  Text,
  InlineStack,
  Select,
  FormLayout,
  Checkbox,
} from "@shopify/polaris";
import {
  adminApi,
  AdminProductVariantLink,
  PodConfig,
  PodCatalog,
  PodCatalogMaterial,
  PodCatalogType,
  PodCatalogOptionGroup,
} from "@/entities/admin/api";

type PodConfigForm = {
  material: string;
  type: string;
  orientation: string;
  sizeKey: string;
  additionalOpts: Record<string, string>;
};

type PodConfigModalProps = {
  variant: AdminProductVariantLink | null;
  productId: string;
  onClose: () => void;
  onSaved: () => void;
};

export function PodConfigModal({
  variant,
  productId,
  onClose,
  onSaved,
}: PodConfigModalProps) {
  const [podConfigForm, setPodConfigForm] = useState<PodConfigForm>({
    material: "",
    type: "",
    orientation: "horizontal",
    sizeKey: "",
    additionalOpts: {},
  });
  const [podProviderSelected, setPodProviderSelected] = useState<string>("pictorem");
  const [availableProviders, setAvailableProviders] = useState<string[]>([
    "pictorem",
  ]);
  const [podCatalog, setPodCatalog] = useState<PodCatalog | null>(null);
  const [podCatalogLoading, setPodCatalogLoading] = useState(false);
  const [savingPodConfig, setSavingPodConfig] = useState(false);
  const [podConfigError, setPodConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!variant) return;
    const cfg = variant.podConfig;
    const material = (cfg?.material as string) ?? "";
    const type = (cfg?.type as string) ?? "";
    const width = cfg?.width != null ? Number(cfg.width) : 0;
    const height = cfg?.height != null ? Number(cfg.height) : 0;
    const sizeKey = width && height ? `${width}x${height}` : "";
    const rawAdditional = Array.isArray(cfg?.additional)
      ? (cfg.additional as string[])
      : [];
    setPodConfigForm({
      material,
      type,
      orientation: (cfg?.orientation as string) ?? "horizontal",
      sizeKey,
      additionalOpts: {},
    });
    setPodProviderSelected(variant.podProvider ?? "pictorem");
    setPodConfigError(null);
    setPodCatalogLoading(true);

    let cancelled = false;
    (async () => {
      try {
        const [catalog, { providers }] = await Promise.all([
          adminApi.orders.podCatalog(),
          adminApi.orders.podProviders(),
        ]);
        if (cancelled) return;
        setPodCatalog(catalog);
        setAvailableProviders(providers);
        // Reconstruct additionalOpts from saved additional codes
        const mat = catalog.materials.find((m) => m.code === material);
        const typ = mat?.types.find((t) => t.code === type);
        if (typ) {
          const opts: Record<string, string> = {};
          for (const group of typ.optionGroups) {
            const match = group.choices.find(
              (c) =>
                c.codes.length > 0 &&
                c.codes.every((code) => rawAdditional.includes(code)),
            );
            opts[group.key] = match?.value ?? group.default;
          }
          setPodConfigForm((p) => ({ ...p, additionalOpts: opts }));
        }
      } catch {
        // best-effort — keep defaults if request fails
      } finally {
        if (!cancelled) setPodCatalogLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [variant]);

  const handleSavePodConfig = async () => {
    if (!variant) return;
    const { material, type, orientation, sizeKey, additionalOpts } = podConfigForm;
    if (!material || !type || !sizeKey) {
      setPodConfigError("Material, tipo y tamaño son obligatorios.");
      return;
    }
    const [w, h] = sizeKey.split("x").map(Number);
    // Build additional from optionGroups in order (canonical Pictorem order)
    const selMat = podCatalog?.materials.find((m) => m.code === material);
    const selTyp = selMat?.types.find((t) => t.code === type);
    const additional: string[] = [];
    if (selTyp) {
      for (const group of selTyp.optionGroups) {
        const chosen = group.choices.find(
          (c) => c.value === (additionalOpts[group.key] ?? group.default),
        );
        if (chosen) additional.push(...chosen.codes);
      }
    }
    const config: PodConfig = {
      material,
      type,
      orientation: orientation || "horizontal",
      width: w,
      height: h,
      additional: additional.length > 0 ? additional : undefined,
    };
    setSavingPodConfig(true);
    setPodConfigError(null);
    try {
      await adminApi.products.updateVariant(productId, variant.shopifyVariantId, {
        podProvider: podProviderSelected,
        podConfig: config,
      });
      onSaved();
    } catch (e: unknown) {
      setPodConfigError((e as Error).message);
    } finally {
      setSavingPodConfig(false);
    }
  };

  const selMat: PodCatalogMaterial | undefined = podCatalog?.materials.find(
    (m) => m.code === podConfigForm.material,
  );
  const selType: PodCatalogType | undefined = selMat?.types.find(
    (t) => t.code === podConfigForm.type,
  );

  return (
    <Modal
      open={!!variant}
      onClose={() => {
        if (!savingPodConfig) onClose();
      }}
      title={`POD Config — ${variant?.shopifyVariantTitle ?? ""}`}
      primaryAction={{
        content: "Guardar",
        loading: savingPodConfig,
        onAction: handleSavePodConfig,
      }}
      secondaryActions={[
        {
          content: "Cancelar",
          disabled: savingPodConfig,
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        {podConfigError && (
          <Banner tone="critical" onDismiss={() => setPodConfigError(null)}>
            {podConfigError}
          </Banner>
        )}
        {podCatalogLoading ? (
          <InlineStack align="center" gap="300">
            <Spinner size="small" />
            <Text as="span" tone="subdued">
              Cargando catálogo…
            </Text>
          </InlineStack>
        ) : (
          <FormLayout>
            <Select
              label="Proveedor POD"
              options={availableProviders.map((p) => ({ label: p, value: p }))}
              value={podProviderSelected}
              onChange={(v) => setPodProviderSelected(v)}
              helpText="Distribuidor que recibirá este ítem al pagarse el pedido"
            />
            <FormLayout.Group>
              <Select
                label="Material *"
                placeholder="Seleccionar material"
                options={
                  podCatalog
                    ? podCatalog.materials.map((m) => ({
                        label: m.label,
                        value: m.code,
                      }))
                    : [
                        {
                          label: podConfigForm.material || "—",
                          value: podConfigForm.material,
                        },
                      ]
                }
                value={podConfigForm.material}
                onChange={(v) =>
                  setPodConfigForm((p) => ({
                    ...p,
                    material: v,
                    type: "",
                    sizeKey: "",
                    additionalOpts: {},
                  }))
                }
              />
              <Select
                label="Tipo *"
                placeholder="Seleccionar tipo"
                disabled={!podConfigForm.material}
                options={
                  selMat
                    ? selMat.types.map((t) => ({ label: t.label, value: t.code }))
                    : [
                        {
                          label: podConfigForm.type || "—",
                          value: podConfigForm.type,
                        },
                      ]
                }
                value={podConfigForm.type}
                onChange={(v) =>
                  setPodConfigForm((p) => ({
                    ...p,
                    type: v,
                    sizeKey: "",
                    additionalOpts: {},
                  }))
                }
              />
            </FormLayout.Group>
            <Select
              label="Tamaño *"
              placeholder="Seleccionar tamaño"
              disabled={!podConfigForm.type}
              options={
                selMat
                  ? selMat.sizes.map((s) => ({
                      label: s.label,
                      value: `${s.width}x${s.height}`,
                    }))
                  : []
              }
              value={podConfigForm.sizeKey}
              onChange={(v) => setPodConfigForm((p) => ({ ...p, sizeKey: v }))}
            />
            <Select
              label="Orientación"
              options={[
                { label: "Horizontal (landscape)", value: "horizontal" },
                { label: "Vertical (portrait)", value: "vertical" },
                { label: "Cuadrado", value: "square" },
              ]}
              value={podConfigForm.orientation}
              onChange={(v) =>
                setPodConfigForm((p) => ({ ...p, orientation: v }))
              }
              helpText="Se deriva automáticamente del formato si se deja en horizontal."
            />
            {selType &&
              selType.optionGroups.length > 0 &&
              selType.optionGroups.map((group: PodCatalogOptionGroup) => {
                const selectedValue =
                  podConfigForm.additionalOpts[group.key] ?? group.default;
                if (group.control === "select") {
                  return (
                    <Select
                      key={group.key}
                      label={group.label}
                      options={group.choices.map((c) => ({
                        label: c.label,
                        value: c.value,
                      }))}
                      value={selectedValue}
                      onChange={(v) =>
                        setPodConfigForm((p) => ({
                          ...p,
                          additionalOpts: { ...p.additionalOpts, [group.key]: v },
                        }))
                      }
                    />
                  );
                }
                const onChoice = group.choices.find(
                  (c) => c.value !== group.default,
                );
                return (
                  <Checkbox
                    key={group.key}
                    label={onChoice?.label ?? group.label}
                    checked={selectedValue !== group.default}
                    onChange={(checked) => {
                      const newVal = checked
                        ? onChoice?.value ?? ""
                        : group.default;
                      setPodConfigForm((p) => ({
                        ...p,
                        additionalOpts: {
                          ...p.additionalOpts,
                          [group.key]: newVal,
                        },
                      }));
                    }}
                  />
                );
              })}
          </FormLayout>
        )}
      </Modal.Section>
    </Modal>
  );
}
