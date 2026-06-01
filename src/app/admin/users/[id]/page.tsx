"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Avatar,
  Badge,
  Button,
  Banner,
  Spinner,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Divider,
  Tabs,
  Thumbnail,
  Pagination,
  EmptyState,
  Grid,
} from "@shopify/polaris";
import {
  adminApi,
  AdminUserDetail,
  AdminUserGeneration,
  AdminUserOrderListItem,
  Paginated,
} from "@/entities/admin/api";

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getHandle(email: string): string {
  return "@" + email.split("@")[0];
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLE_TONES: Record<
  string,
  "attention" | "warning" | "info"
> = {
  admin: "attention",
  premium: "warning",
  user: "info",
};

const GEN_STATUS_TONES: Record<
  string,
  "success" | "critical" | "warning" | "enabled"
> = {
  completed: "success",
  failed: "critical",
  processing: "warning",
  pending: "enabled",
};

const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [gens, setGens] = useState<Paginated<AdminUserGeneration> | null>(null);
  const [genPage, setGenPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gensLoading, setGensLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    adminApi.users
      .detail(id)
      .then(setUser)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setGensLoading(true);
    adminApi.users
      .generations(id, genPage)
      .then(setGens)
      .catch(() => {})
      .finally(() => setGensLoading(false));
  }, [id, genPage]);

  if (loading) {
    return (
      <Box padding="600">
        <InlineStack align="center" gap="300">
          <Spinner />
          <Text as="span" tone="subdued">
            Cargando usuario…
          </Text>
        </InlineStack>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Page
        backAction={{ url: "/admin/users", content: "Usuarios" }}
        title="Usuario no encontrado"
      >
        <Banner tone="critical">{error ?? "Usuario no encontrado"}</Banner>
      </Page>
    );
  }

  const allPhotos = user.pets.flatMap((p) =>
    p.photos.map((ph) => ({ ...ph, petName: p.name, petSpecies: p.species }))
  );

  const tabs = [
    { id: "resumen", content: "Resumen", panelID: "panel-resumen" },
    { id: "mascotas", content: "Mascotas", panelID: "panel-mascotas" },
    { id: "imagenes", content: "Imágenes", panelID: "panel-imagenes" },
    { id: "ia", content: "Resultados IA", panelID: "panel-ia" },
    { id: "pedidos", content: "Pedidos", panelID: "panel-pedidos" },
  ];

  return (
    <Page
      backAction={{ url: "/admin/users", content: "Usuarios" }}
      title={user.fullName || getHandle(user.email)}
      subtitle={user.email}
      titleMetadata={
        <InlineStack gap="200">
          <Badge tone={ROLE_TONES[user.role] ?? "enabled"}>
            {user.role}
          </Badge>
          <Badge tone={user.isActive ? "success" : "enabled"}>
            {user.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </InlineStack>
      }
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            {/* Profile card */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="center">
                  <Avatar
                    size="xl"
                    initials={getInitials(user.fullName, user.email)}
                    name={user.fullName ?? user.email}
                  />
                </InlineStack>
                <BlockStack gap="200">
                  <InlineStack gap="200" align="center">
                    <Badge tone={ROLE_TONES[user.role] ?? "enabled"}>
                      {user.role}
                    </Badge>
                    <Badge tone={user.isActive ? "success" : "enabled"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </InlineStack>
                  <Divider />
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Email
                    </Text>
                    <Text variant="bodyMd" as="span">
                      {user.email}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Email verificado
                    </Text>
                    <Badge tone={user.emailVerified ? "success" : "critical"}>
                      {user.emailVerified ? "Verificado" : "No verificado"}
                    </Badge>
                  </BlockStack>
                  {user.lastLoginAt && (
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Último acceso
                      </Text>
                      <Text variant="bodyMd" as="span">
                        {fmtDate(user.lastLoginAt)}
                      </Text>
                    </BlockStack>
                  )}
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Miembro desde
                    </Text>
                    <Text variant="bodyMd" as="span">
                      {fmtDate(user.createdAt)}
                    </Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Stats */}
            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h2">
                  Estadísticas
                </Text>
                <Grid columns={{ xs: 2 }}>
                  {[
                    { label: "Mascotas", value: user.pets.length },
                    { label: "Imágenes", value: allPhotos.length },
                    { label: "Generaciones IA", value: gens?.meta.total ?? "—" },
                    { label: "Días desde alta", value: daysSince(user.createdAt) },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: "#f6f6f7",
                        borderRadius: 8,
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      <Text variant="headingLg" as="p">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </Text>
                      <Text variant="bodySm" tone="subdued" as="span">
                        {stat.label}
                      </Text>
                    </div>
                  ))}
                </Grid>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={setSelectedTab}
            >
              <Box padding="400">
                {selectedTab === 0 && (
                  <BlockStack gap="500">
                    {/* Photos preview */}
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text variant="headingMd" as="h2">
                          Fotos de mascotas ({allPhotos.length})
                        </Text>
                        {allPhotos.length > 9 && (
                          <Button
                            variant="plain"
                            onClick={() => setSelectedTab(2)}
                          >
                            Ver todas →
                          </Button>
                        )}
                      </InlineStack>
                      {allPhotos.length === 0 ? (
                        <Text as="p" tone="subdued">
                          Sin fotos subidas.
                        </Text>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(60px, 1fr))",
                            gap: 8,
                          }}
                        >
                          {allPhotos.slice(0, 9).map((ph) => (
                            <div
                              key={ph.id}
                              style={{
                                aspectRatio: "1",
                                borderRadius: 8,
                                overflow: "hidden",
                                border: ph.isPrimary
                                  ? "2px solid #448da6"
                                  : "2px solid #e3e3e3",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ph.photoUrl}
                                alt={ph.petName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </BlockStack>

                    {/* Generations preview */}
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text variant="headingMd" as="h2">
                          Resultados IA ({gens?.meta.total ?? 0})
                        </Text>
                        {gens && gens.meta.total > 6 && (
                          <Button
                            variant="plain"
                            onClick={() => setSelectedTab(3)}
                          >
                            Ver todos →
                          </Button>
                        )}
                      </InlineStack>
                      <GenerationsGrid
                        gens={gens}
                        loading={gensLoading}
                        preview={6}
                      />
                    </BlockStack>
                  </BlockStack>
                )}

                {selectedTab === 1 && (
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      Mascotas ({user.pets.length})
                    </Text>
                    {user.pets.length === 0 ? (
                      <EmptyState heading="Sin mascotas registradas" image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                        <Text as="p" tone="subdued">
                          Este usuario no tiene mascotas.
                        </Text>
                      </EmptyState>
                    ) : (
                      user.pets.map((pet) => (
                        <Card key={pet.id}>
                          <BlockStack gap="300">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="headingSm" as="h3">
                                {pet.name}
                              </Text>
                              <Text variant="bodySm" tone="subdued" as="span">
                                {pet.species}
                                {pet.breed ? ` · ${pet.breed}` : ""}
                              </Text>
                              {!pet.isActive && (
                                <Badge tone="enabled">Inactiva</Badge>
                              )}
                            </InlineStack>
                            {pet.photos.length === 0 ? (
                              <Text as="p" tone="subdued" variant="bodySm">
                                Sin fotos subidas.
                              </Text>
                            ) : (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(60px, 1fr))",
                                  gap: 8,
                                }}
                              >
                                {pet.photos.map((ph) => (
                                  <div
                                    key={ph.id}
                                    style={{
                                      aspectRatio: "1",
                                      borderRadius: 8,
                                      overflow: "hidden",
                                      border: ph.isPrimary
                                        ? "2px solid #448da6"
                                        : "2px solid #e3e3e3",
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={ph.photoUrl}
                                      alt={pet.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      loading="lazy"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </BlockStack>
                        </Card>
                      ))
                    )}
                  </BlockStack>
                )}

                {selectedTab === 2 && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h2">
                      Imágenes subidas ({allPhotos.length})
                    </Text>
                    {allPhotos.length === 0 ? (
                      <EmptyState heading="Sin imágenes" image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                        <Text as="p" tone="subdued">
                          Sin fotos subidas.
                        </Text>
                      </EmptyState>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(60px, 1fr))",
                          gap: 8,
                        }}
                      >
                        {allPhotos.map((ph) => (
                          <div
                            key={ph.id}
                            style={{
                              position: "relative",
                              aspectRatio: "1",
                              borderRadius: 8,
                              overflow: "hidden",
                              border: ph.isPrimary
                                ? "2px solid #448da6"
                                : "2px solid #e3e3e3",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ph.photoUrl}
                              alt={ph.petName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </BlockStack>
                )}

                {selectedTab === 3 && (
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      Resultados IA ({gens?.meta.total ?? 0})
                    </Text>
                    <GenerationsGrid gens={gens} loading={gensLoading} />
                    {gens && gens.meta.totalPages > 1 && (
                      <InlineStack align="center">
                        <Pagination
                          hasPrevious={genPage > 1}
                          hasNext={genPage < gens.meta.totalPages}
                          onPrevious={() => setGenPage((p) => p - 1)}
                          onNext={() => setGenPage((p) => p + 1)}
                          label={`Pág. ${gens.meta.page} / ${gens.meta.totalPages}`}
                        />
                      </InlineStack>
                    )}
                  </BlockStack>
                )}

                {selectedTab === 4 && <UserOrdersList userId={id} />}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function GenerationsGrid({
  gens,
  loading,
  preview,
}: {
  gens: Paginated<AdminUserGeneration> | null;
  loading: boolean;
  preview?: number;
}) {
  if (loading) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando generaciones…
        </Text>
      </InlineStack>
    );
  }

  const items = preview ? gens?.data.slice(0, preview) : gens?.data;

  if (!items || items.length === 0) {
    return (
      <Text as="p" tone="subdued">
        Este usuario no tiene generaciones.
      </Text>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((g) => {
        const imgUrl = g.thumbnailUrl ?? g.resultUrl;
        return (
          <Card key={g.id} padding="200">
            <BlockStack gap="200">
              <div
                style={{
                  aspectRatio: "1",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#f6f6f7",
                }}
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={g.style?.displayName ?? "Generación"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text as="span" tone="subdued">
                      —
                    </Text>
                  </div>
                )}
              </div>
              <BlockStack gap="050">
                <Text variant="bodySm" as="span" truncate>
                  {g.style?.displayName ?? "—"}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span" truncate>
                  {g.pet?.name ?? "—"}
                </Text>
                <Badge
                  tone={GEN_STATUS_TONES[g.status] ?? "enabled"}
                  size="small"
                >
                  {g.status}
                </Badge>
              </BlockStack>
            </BlockStack>
          </Card>
        );
      })}
    </div>
  );
}

function UserOrdersList({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Paginated<AdminUserOrderListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.users
      .orders(userId, page)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [userId, page]);

  if (loading) {
    return (
      <InlineStack gap="300" blockAlign="center">
        <Spinner size="small" />
        <Text as="span" tone="subdued">
          Cargando pedidos…
        </Text>
      </InlineStack>
    );
  }

  if (!orders?.data.length) {
    return (
      <EmptyState heading="Sin pedidos registrados" image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
        <Text as="p" tone="subdued">
          No se encontraron pedidos para este usuario.
        </Text>
      </EmptyState>
    );
  }

  return (
    <BlockStack gap="300">
      {orders.data.map((order) => {
        const thumb =
          order.items[0]?.generation?.resultUrl ?? order.items[0]?.imageUrl;
        return (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            style={{ textDecoration: "none" }}
          >
            <Card>
              <InlineStack gap="400" blockAlign="center">
                <div style={{ flexShrink: 0 }}>
                  {thumb ? (
                    <Thumbnail source={thumb} alt="" size="small" />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        background: "#f6f6f7",
                        border: "1px solid #e3e3e3",
                      }}
                    />
                  )}
                </div>
                <BlockStack gap="0">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {order.orderNumber}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="span">
                    {new Date(order.shopifyCreatedAt).toLocaleDateString(
                      "es-ES",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}{" "}
                    · {order.items.length} item(s)
                  </Text>
                </BlockStack>
                <BlockStack gap="100" inlineAlign="end">
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: order.currency,
                    }).format(order.totalAmount)}
                  </Text>
                  <InlineStack gap="100">
                    {[
                      ...new Set(order.items.map((i) => i.productionStatus)),
                    ].map((s) => (
                      <Badge key={s} size="small" tone="enabled">
                        {PRODUCTION_STATUS_LABELS[s] ?? s}
                      </Badge>
                    ))}
                  </InlineStack>
                </BlockStack>
              </InlineStack>
            </Card>
          </Link>
        );
      })}

      {orders.meta.totalPages > 1 && (
        <InlineStack align="center">
          <Pagination
            hasPrevious={page > 1}
            hasNext={page < orders.meta.totalPages}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </InlineStack>
      )}
    </BlockStack>
  );
}
