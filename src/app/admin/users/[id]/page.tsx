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
import {
  fmtAbsoluteDate,
  getHandle,
  roleBadgeTone,
} from "@/entities/admin/lib/user-format";
import {
  USER_STATUS_EFFECT,
  userStatusLabel,
  userStatusTone,
} from "@/entities/admin/lib/user-status";
import { useUserDetail } from "./useUserDetail";
import { useUserCreditEconomics } from "./useUserCreditEconomics";
import { CreditsPanel } from "./_components/CreditsPanel";
import { GenerationsPanel } from "./_components/GenerationsPanel";
import { PbnPanel } from "./_components/PbnPanel";
import { PetsPanel } from "./_components/PetsPanel";
import { UserExpensesCard } from "./_components/UserExpensesCard";
import { UserExpensesPanel } from "./_components/UserExpensesPanel";
import { UserOrdersPanel } from "./_components/UserOrdersPanel";
import { UserProfileCard } from "./_components/UserProfileCard";
import { UserStatsCard } from "./_components/UserStatsCard";
import { UserStatusModal } from "./_components/UserStatusModal";

const TABS = [
  { id: "mascotas", content: "Mascotas", panelID: "panel-mascotas" },
  { id: "ia", content: "Arte IA", panelID: "panel-ia" },
  { id: "pbn", content: "Paint by Numbers", panelID: "panel-pbn" },
  { id: "creditos", content: "Créditos", panelID: "panel-creditos" },
  { id: "pedidos", content: "Pedidos", panelID: "panel-pedidos" },
  { id: "gastos", content: "Gastos", panelID: "panel-gastos" },
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
    revenue,
    loadingRevenue,
    gens,
    gensLoading,
    genPage,
    setGenPage,
    applyGrant,
    statusAction,
    openStatusAction,
    closeStatusAction,
    savingStatus,
    statusError,
    dismissStatusError,
    submitStatusAction,
  } = useUserDetail(id);
  // Vive en la página, no en la pestaña de créditos: la card lateral que lo
  // muestra está siempre visible, y el abono manual tiene que refrescarlo.
  const {
    economics,
    loading: loadingEconomics,
    reload: reloadEconomics,
  } = useUserCreditEconomics(id);
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

  const userName = user.fullName || getHandle(user.email);

  // Las acciones disponibles dependen del estado: una cuenta ya suspendida se
  // reactiva, una dada de baja solo se restaura (y solo si aún no se purgó).
  const statusActions =
    user.status === "deleted"
      ? [
          {
            content: "Restaurar",
            disabled: Boolean(user.anonymizedAt),
            onAction: () => openStatusAction("restore"),
          },
        ]
      : [
          user.status === "active"
            ? {
                content: "Suspender",
                onAction: () => openStatusAction("ban"),
              }
            : {
                content: "Reactivar",
                onAction: () => openStatusAction("reactivate"),
              },
          {
            content: "Dar de baja",
            destructive: true,
            onAction: () => openStatusAction("delete"),
          },
        ];

  return (
    <Page
      backAction={{ url: "/admin/users", content: "Usuarios" }}
      title={userName}
      subtitle={user.email}
      secondaryActions={statusActions}
      titleMetadata={
        <InlineStack gap="200" blockAlign="center">
          <Badge tone={roleBadgeTone(user.role)}>{user.role}</Badge>
          <Badge tone={userStatusTone(user.status)}>
            {userStatusLabel(user.status)}
          </Badge>
        </InlineStack>
      }
    >
      <UserStatusModal
        key={statusAction ?? "none"}
        action={statusAction}
        userName={userName}
        saving={savingStatus}
        error={statusError}
        onDismissError={dismissStatusError}
        onClose={closeStatusAction}
        onConfirm={submitStatusAction}
      />

      <Layout>
        {user.status !== "active" && (
          <Layout.Section variant="fullWidth">
            <Banner
              tone={user.status === "inactive" ? "warning" : "critical"}
              title={`Cuenta: ${userStatusLabel(user.status).toLowerCase()}`}
            >
              <BlockStack gap="100">
                <Text as="p">{USER_STATUS_EFFECT[user.status]}</Text>
                {user.statusReason && (
                  <Text as="p">
                    <Text as="span" fontWeight="semibold">
                      Motivo:
                    </Text>{" "}
                    {user.statusReason}
                  </Text>
                )}
                {user.statusChangedAt && (
                  <Text as="p" tone="subdued">
                    {fmtAbsoluteDate(user.statusChangedAt)}
                    {user.statusChangedBy ? " · por un admin" : " · automático"}
                  </Text>
                )}
                {user.anonymizedAt && (
                  <Text as="p" tone="subdued">
                    Datos personales borrados el{" "}
                    {fmtAbsoluteDate(user.anonymizedAt)}. La baja ya no se puede
                    deshacer.
                  </Text>
                )}
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section variant="fullWidth">
          <UserStatsCard
            user={user}
            photoCount={allPhotos.length}
            generationCount={gens?.meta.total ?? null}
          />
        </Layout.Section>
        <Layout.Section>
          <Card padding="0">
            <Tabs tabs={TABS} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {selectedTab === 0 && <PetsPanel pets={user.pets} />}
                {selectedTab === 1 && (
                  <GenerationsPanel
                    gens={gens}
                    loading={gensLoading}
                    page={genPage}
                    onPageChange={setGenPage}
                  />
                )}
                {selectedTab === 2 && <PbnPanel userId={id} />}
                {selectedTab === 3 && (
                  <CreditsPanel
                    userId={id}
                    balance={user.generationCredits}
                    onGranted={(newBalance) => {
                      applyGrant(newBalance);
                      // El abono mueve el saldo, y con él el costo futuro
                      // estimado de la card lateral.
                      reloadEconomics();
                    }}
                    baseCurrency={economics?.baseCurrency ?? "CAD"}
                  />
                )}
                {selectedTab === 4 && <UserOrdersPanel userId={id} />}
                {selectedTab === 5 && (
                  <UserExpensesPanel
                    userId={id}
                    expenses={expenses}
                    loadingSummary={loadingExpenses}
                    economics={economics}
                    loadingEconomics={loadingEconomics}
                  />
                )}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <UserProfileCard user={user} />
            <UserExpensesCard
              revenue={revenue}
              loadingRevenue={loadingRevenue}
              expenses={expenses}
              loading={loadingExpenses}
              economics={economics}
              loadingEconomics={loadingEconomics}
            />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
