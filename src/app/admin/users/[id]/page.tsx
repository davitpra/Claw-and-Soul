"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Tabs,
  Text,
} from "@shopify/polaris";
import { getHandle, roleBadgeTone } from "@/entities/admin/lib/user-format";
import { useUserDetail } from "./useUserDetail";
import { GenerationsPanel } from "./_components/GenerationsPanel";
import { GrantCreditsCard } from "./_components/GrantCreditsCard";
import { PetsPanel } from "./_components/PetsPanel";
import { PhotosPanel } from "./_components/PhotosPanel";
import { UserExpensesCard } from "./_components/UserExpensesCard";
import { UserOrdersPanel } from "./_components/UserOrdersPanel";
import { UserProfileCard } from "./_components/UserProfileCard";
import { UserStatsCard } from "./_components/UserStatsCard";

const TABS = [
  { id: "mascotas", content: "Mascotas", panelID: "panel-mascotas" },
  { id: "imagenes", content: "Imágenes", panelID: "panel-imagenes" },
  { id: "ia", content: "Resultados IA", panelID: "panel-ia" },
  { id: "pedidos", content: "Pedidos", panelID: "panel-pedidos" },
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    user,
    loading,
    error,
    allPhotos,
    expenses,
    loadingExpenses,
    gens,
    gensLoading,
    genPage,
    setGenPage,
    applyGrant,
  } = useUserDetail(id);
  const [selectedTab, setSelectedTab] = useState(0);

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

  return (
    <Page
      backAction={{ url: "/admin/users", content: "Usuarios" }}
      title={user.fullName || getHandle(user.email)}
      subtitle={user.email}
      titleMetadata={
        <InlineStack gap="200">
          <Badge tone={roleBadgeTone(user.role)}>{user.role}</Badge>
          <Badge tone={user.isActive ? "success" : "enabled"}>
            {user.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </InlineStack>
      }
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <UserProfileCard user={user} />
            <UserStatsCard
              user={user}
              photoCount={allPhotos.length}
              generationCount={gens?.meta.total ?? null}
            />
            <GrantCreditsCard
              userId={id}
              balance={user.generationCredits}
              onGranted={applyGrant}
            />
            <UserExpensesCard
              expenses={expenses}
              loading={loadingExpenses}
            />
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <Tabs tabs={TABS} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {selectedTab === 0 && <PetsPanel pets={user.pets} />}
                {selectedTab === 1 && <PhotosPanel photos={allPhotos} />}
                {selectedTab === 2 && (
                  <GenerationsPanel
                    gens={gens}
                    loading={gensLoading}
                    page={genPage}
                    onPageChange={setGenPage}
                  />
                )}
                {selectedTab === 3 && <UserOrdersPanel userId={id} />}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
