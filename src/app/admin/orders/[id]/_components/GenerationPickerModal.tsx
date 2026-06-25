"use client";

import { useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Box,
  InlineStack,
  Modal,
  Spinner,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { adminApi, AdminUserGeneration } from "@/entities/admin/api";
import { fmtDate } from "@/entities/admin/lib/order-format";

type GenerationPickerModalProps = {
  userId: string;
  orderId: string;
  itemId: string;
  currentGenerationId: string | null;
  onClose: () => void;
  onLinked: () => void;
};

// Modal para re-vincular el item a otra generación del cliente. Lista las
// generaciones del usuario (paginadas) y permite elegir una.
export function GenerationPickerModal({
  userId,
  orderId,
  itemId,
  currentGenerationId,
  onClose,
  onLinked,
}: GenerationPickerModalProps) {
  const [generations, setGenerations] = useState<AdminUserGeneration[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi.users
      .generations(userId, page)
      .then((res) => {
        if (cancelled) return;
        setGenerations((prev) =>
          page === 1 ? res.data : [...prev, ...res.data],
        );
        setTotalPages(res.meta.totalPages);
      })
      .catch((e) => !cancelled && setErr((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  async function handleSelect(gen: AdminUserGeneration) {
    if (gen.id === currentGenerationId) {
      onClose();
      return;
    }
    setLinkingId(gen.id);
    setErr(null);
    try {
      await adminApi.orders.linkGeneration(orderId, itemId, gen.id);
      onLinked();
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLinkingId(null);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Cambiar generación"
      secondaryActions={[{ content: "Cerrar", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {err && (
            <Banner tone="critical" onDismiss={() => setErr(null)}>
              {err}
            </Banner>
          )}

          {generations.length === 0 && loading ? (
            <InlineStack align="center" gap="200">
              <Spinner size="small" />
              <Text as="span" tone="subdued">
                Cargando generaciones…
              </Text>
            </InlineStack>
          ) : generations.length === 0 ? (
            <Text as="p" tone="subdued">
              Este cliente no tiene generaciones.
            </Text>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 12,
              }}
            >
              {generations.map((gen) => {
                const img = gen.thumbnailUrl ?? gen.resultUrl;
                const isCurrent = gen.id === currentGenerationId;
                return (
                  <button
                    key={gen.id}
                    type="button"
                    onClick={() => handleSelect(gen)}
                    disabled={linkingId !== null}
                    style={{
                      border: isCurrent
                        ? "2px solid #448da6"
                        : "1px solid #e3e3e3",
                      borderRadius: 8,
                      padding: 6,
                      background: "#fff",
                      cursor: linkingId !== null ? "default" : "pointer",
                      textAlign: "left",
                      opacity: linkingId && linkingId !== gen.id ? 0.5 : 1,
                    }}
                  >
                    <BlockStack gap="100" inlineAlign="center">
                      {img ? (
                        <Thumbnail
                          source={img}
                          alt={gen.style?.displayName ?? "Generación"}
                          size="large"
                        />
                      ) : (
                        <Box
                          background="bg-surface-secondary"
                          padding="400"
                          borderRadius="200"
                        >
                          <Text as="span" tone="subdued" variant="bodySm">
                            {gen.status}
                          </Text>
                        </Box>
                      )}
                      <Text as="span" variant="bodySm" alignment="center">
                        {gen.style?.displayName ?? gen.type}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {fmtDate(gen.createdAt)}
                      </Text>
                      {isCurrent && (
                        <Text as="span" variant="bodySm" tone="subdued">
                          Actual
                        </Text>
                      )}
                    </BlockStack>
                  </button>
                );
              })}
            </div>
          )}

          {page < totalPages && (
            <InlineStack align="center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                style={{
                  border: "none",
                  background: "none",
                  color: "#448da6",
                  cursor: loading ? "default" : "pointer",
                  padding: 8,
                }}
              >
                {loading ? "Cargando…" : "Cargar más"}
              </button>
            </InlineStack>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
