"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Select,
  Spinner,
} from "@shopify/polaris";
import { adminApi, AdminProduct } from "@/entities/admin/api";
import { shopifyFetch } from "@/lib/shopify/client";
import { GET_COLLECTIONS } from "@/lib/shopify/queries/collections";
import { getCollectionProducts } from "@/lib/shopify/actions/collections";
import ImagePreviewModal from "@/app/admin/_components/ImagePreviewModal";

type CollectionImage = { url: string; alt: string | null; title: string };

export function ShowcaseCollectionCard({
  productId,
  initialHandle,
}: {
  productId: string;
  initialHandle: string | null;
}) {
  const [handle, setHandle] = useState(initialHandle ?? "");
  const [collections, setCollections] = useState<
    { handle: string; title: string }[]
  >([]);
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CollectionImage | null>(null);

  const loadCollections = async () => {
    try {
      const { data } = await shopifyFetch<{
        collections: {
          edges: Array<{ node: { handle: string; title: string } }>;
        };
      }>({ query: GET_COLLECTIONS, variables: { first: 250 } });
      setCollections(data.collections.edges.map((e) => e.node));
    } catch {
      // best-effort
    }
  };

  const loadImages = async (collectionHandle: string) => {
    if (!collectionHandle) {
      setImages([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const collection = await getCollectionProducts(collectionHandle, 24);
      const rows: CollectionImage[] = (collection?.products.edges ?? [])
        .map((e) => ({
          url: e.node.images.edges[0]?.node.url ?? "",
          alt: e.node.images.edges[0]?.node.altText ?? null,
          title: e.node.title,
        }))
        .filter((img) => img.url);
      setImages(rows);
    } catch (err: unknown) {
      setError((err as Error).message);
      setImages([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadCollections();
    if (initialHandle) loadImages(initialHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleChange = async (value: string) => {
    setHandle(value);
    setError(null);
    setSaving(true);
    try {
      await adminApi.products.update(productId, {
        showcaseCollectionHandle: value || null,
      } as Partial<AdminProduct>);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
    loadImages(value);
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" blockAlign="center" align="space-between">
          <Text variant="headingSm" as="h2">
            Colección destacada
          </Text>
          {saving && <Spinner size="small" />}
        </InlineStack>

        <Select
          label="Colección"
          labelHidden
          options={[
            { label: "Ninguna", value: "" },
            ...collections.map((c) => ({ label: c.title, value: c.handle })),
          ]}
          value={handle}
          onChange={handleChange}
          disabled={saving}
          helpText="Colección de Shopify que se muestra en la página del producto."
        />

        {error && (
          <Text as="p" tone="critical">
            {error}
          </Text>
        )}

        {!handle ? (
          <Text as="p" tone="subdued">
            Sin colección asignada. Elige una para previsualizar sus productos.
          </Text>
        ) : loadingProducts ? (
          <Spinner size="small" />
        ) : images.length === 0 ? (
          <Text as="p" tone="subdued">
            Esta colección no tiene productos con imágenes.
          </Text>
        ) : (
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingXs" as="h3">
                Productos
              </Text>
              <Badge tone="info">{String(images.length)}</Badge>
            </InlineStack>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {images.map((img, i) => (
                <CollectionImageTile
                  key={`${img.url}-${i}`}
                  image={img}
                  onClick={() => setPreview(img)}
                />
              ))}
            </div>
          </BlockStack>
        )}
      </BlockStack>

      {preview && (
        <ImagePreviewModal
          src={preview.url}
          title={preview.title || "Producto"}
          onClose={() => setPreview(null)}
        />
      )}
    </Card>
  );
}

function CollectionImageTile({
  image,
  onClick,
}: {
  image: CollectionImage;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--p-color-border)",
        aspectRatio: "1 / 1",
        background: "var(--p-color-bg-surface)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Ampliar ${image.title}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "zoom-in",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt ?? image.title}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>
    </div>
  );
}
