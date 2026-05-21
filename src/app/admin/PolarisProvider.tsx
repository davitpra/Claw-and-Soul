"use client";

import "@shopify/polaris/build/esm/styles.css";
import "./polaris-overrides.css";
import { AppProvider } from "@shopify/polaris";
import esTranslations from "@shopify/polaris/locales/es.json";

export default function PolarisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider i18n={esTranslations}>{children}</AppProvider>;
}
