import type { PbnConfig } from "@/lib/pbn/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Ciclo de vida de la cuenta. El backend mantiene el invariante
 * `isActive === (status === "active")`, así que `status` es siempre el dato más
 * informativo de los dos: además del corte, dice por qué.
 */
export type AdminUserStatus = "active" | "banned" | "inactive" | "deleted";

/**
 * Lo que devuelven los endpoints de estado: solo los campos del ciclo de vida,
 * no la ficha completa (el backend evita a propósito responder con la fila
 * entera del usuario).
 */
export interface AdminUserStatusSummary {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  status: AdminUserStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  statusChangedBy: string | null;
  deletedAt: string | null;
  anonymizedAt: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  status: AdminUserStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  deletedAt: string | null;
  generationCredits: number;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    pets: number;
    generations: number;
    paintByNumbers: number;
    /** Solo pedidos enlazados a la cuenta: los de invitado no se atribuyen. */
    orders: number;
  };
}

export interface AdminUserPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
  orderIndex: number;
}

export interface AdminUserPet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  isActive: boolean;
  photos: AdminUserPhoto[];
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  status: AdminUserStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  /** User.id del admin que hizo el cambio; null si fue el cron o el propio usuario. */
  statusChangedBy: string | null;
  deletedAt: string | null;
  /** Con fecha aquí, la cuenta ya está purgada y no se puede restaurar. */
  anonymizedAt: string | null;
  emailVerified: boolean;
  generationCredits: number;
  /** Consumo neto en generaciones (spends menos refunds), en positivo. */
  creditsSpent: number;
  createdAt: string;
  lastLoginAt: string | null;
  pets: AdminUserPet[];
}

export interface AdminUserGeneration {
  id: string;
  status: string;
  type: string;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  pet: { id: string; name: string; species: string } | null;
  style: { id: string; displayName: string } | null;
}

export interface AdminOrderItemSummary {
  id: string;
  title: string;
  productionStatus: string;
  fulfillmentMethod: string;
  imageUrl: string | null;
  generation: { resultUrl: string | null } | null;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  customerName: string | null;
  userId: string | null;
  totalAmount: number;
  currency: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  fulfillmentDisplayStatus: string | null;
  shopifyCreatedAt: string;
  items: AdminOrderItemSummary[];
}

export interface AdminOrderItem {
  id: string;
  shopifyLineItemId: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
  printImageUrl: string | null;
  style: string | null;
  size: string | null;
  fulfillmentMethod: string;
  productionStatus: string;
  notes: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  productRef: {
    id: string;
    name: string;
    displayName: string;
    fulfillmentMethod: string;
    shopifyHandle: string | null;
    images: { imageUrl: string }[];
    style: { images: { imageUrl: string }[] } | null;
  } | null;
  productVariant: {
    id: string;
    shopifyVariantId: string;
    shopifyVariantTitle: string;
  } | null;
  generation: {
    id: string;
    resultUrl: string | null;
    thumbnailUrl: string | null;
    pet: { id: string; name: string; species: string } | null;
    style: { id: string; displayName: string } | null;
  } | null;
  paintByNumbers: {
    id: string;
    outlineSvgUrl: string | null;
    previewUrl: string | null;
  } | null;
}

// Config JSON persisted with a PBN. Vive en `lib/pbn` porque también la lee el
// dashboard de usuario; se reexporta aquí para no romper los imports de admin.
export type { PbnConfig };

export interface AdminPaintByNumbers {
  id: string;
  sourceImageUrl: string | null;
  outlineSvgUrl: string | null;
  previewUrl: string | null;
  paletteUrl: string | null;
  colorCount: number | null;
  origin: string;
  config: PbnConfig;
}

export interface AdminOrderEvent {
  id: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  source: string;
  userId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  userId: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  fulfillmentDisplayStatus: string | null;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number | null;
  taxAmount: number | null;
  totalAmount: number;
  productionCost: number | null;
  shippingAddress: Record<string, string> | null;
  billingAddress: Record<string, string> | null;
  customerNote: string | null;
  shopifyCreatedAt: string;
  cancelledAt: string | null;
  user: { id: string; email: string; fullName: string | null } | null;
  items: AdminOrderItem[];
  events: AdminOrderEvent[];
}

export interface AdminUserOrderItem {
  id: string;
  title: string;
  productionStatus: string;
  imageUrl: string | null;
  /** Id numérico de la variante comprada: cruza con `useShopifyVariantImages`. */
  shopifyVariantId: string | null;
  productRef: {
    shopifyHandle: string | null;
    /** Imagen primaria del estilo: fallback de catálogo si Shopify no responde. */
    style: { images: { imageUrl: string }[] } | null;
  } | null;
  generation: { resultUrl: string | null } | null;
}

export interface AdminUserOrderListItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  financialStatus: string | null;
  shopifyCreatedAt: string;
  items: AdminUserOrderItem[];
}

/**
 * PBN guardado del usuario, tal como lo lista
 * `GET /admin/users/:id/paint-by-numbers`. El backend proyecta con
 * `USER_PBN_LIST_SELECT`: sin `config` (pesado) ni las claves de storage.
 */
export interface AdminUserPbn {
  id: string;
  sourceImageUrl: string | null;
  previewUrl: string | null;
  outlineSvgUrl: string | null;
  paletteUrl: string | null;
  colorCount: number | null;
  /** saved | ordered */
  status: string;
  /** customer | admin */
  origin: string;
  createdAt: string;
  /** Casi siempre null: al guardar un PBN no se manda `petId`. Ver `generation.pet`. */
  pet: { id: string; name: string } | null;
  generation: {
    id: string;
    pet: { id: string; name: string } | null;
    style: { displayName?: string | null; category?: string | null } | null;
  } | null;
}

export interface AdminCreditTransaction {
  id: string;
  amount: number; // + grant, - spend
  reason: string; // signup_bonus | order_bonus | pack_purchase | admin_grant | generation_spend | generation_refund | order_bonus_reversal | pack_purchase_reversal
  referenceId: string | null;
  /**
   * Costo real de la generación referenciada, en moneda base. Sólo lo llevan
   * los movimientos de gasto; los bonos y packs son saldo concedido, no gasto,
   * y llegan como `null` — igual que un reembolso, porque una generación
   * fallida nunca deja `Expense`.
   */
  costBase: number | null;
  note: string | null;
  createdAt: string;
}

export interface OrderStats {
  total: number;
  period: number;
  revenue: number;
  byProductionStatus: Record<string, number>;
}

export interface OverviewStats {
  totals: {
    users: number;
    pets: number;
    generations: number;
    styles: number;
    formats: number;
    products: number;
  };
  usersByRole: Record<string, number>;
  generationsByStatus: Record<string, number>;
  generationsByType: Record<string, number>;
  petsBySpecies: Record<string, number>;
  topStyles: { styleId: string; displayName: string; count: number }[];
  recentSyncs: {
    id: string;
    type: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    productsChecked: number | null;
    productsCreated: number | null;
    productsUpdated: number | null;
  }[];
  timeline: { day: string; count: number }[];
  orders: {
    thisWeek: number;
    revenueThisWeek: number;
    byProductionStatus: Record<string, number>;
  };
}

export interface AdminPetPhoto {
  id: string;
  petId: string;
  photoUrl: string;
  photoStorageKey: string;
  isPrimary: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface AdminPet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos: AdminPetPhoto[];
}

export interface AdminStyleImage {
  id: string;
  styleId: string;
  imageUrl: string;
  storageKey: string;
  altImage: string | null;
  orderIndex: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface AdminImageGeneration {
  id: string;
  prompt: string;
  finalPrompt: string | null;
  metadata: Record<string, unknown> | null;
  visionAnalysis: Record<string, unknown> | null;
  provider: string;
  falRequestId: string | null;
  processingTimeSeconds: number | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminVisionConfig {
  id: string;
  name: string;
  description: string | null;
  visionModel: string | null;
  visionTemperature: number | null;
  systemPrompt: string | null;
  maxTokens: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminImageGenConfig {
  id: string;
  name: string;
  description: string | null;
  model: string | null;
  parameters: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConfigStyleUsage {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

export interface AdminStyle {
  id: string;
  name: string;
  displayName: string;
  category: string;
  difficulty: "easy" | "medium" | "challenging" | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  strategyKey: string;
  promptTemplate: string;
  templateVars: Record<string, unknown> | null;
  templateVarOptions: Record<string, unknown> | null;
  // Default del estudio PBN para el estilo ({ input, render }); ver PbnConfig.
  pbnConfig: PbnConfig | null;
  visionConfigId: string | null;
  imageGenConfigId: string | null;
  visionConfig: AdminVisionConfig | null;
  imageGenConfig: AdminImageGenConfig | null;
  previewUrl: string | null;
  styleReferenceUrl: string | null;
  styleReferenceStorageKey: string | null;
  images: AdminStyleImage[];
  _count?: { generations: number; productReferences: number };
}

export interface AdminFormat {
  id: string;
  name: string;
  displayName: string;
  aspectRatio: string;
  width: number;
  height: number;
  shopifyVariantOption: string | null;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  shopifyProductId: string;
  shopifyHandle: string | null;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  styleId: string | null;
  style: {
    id: string;
    name: string;
    displayName: string;
    previewUrl: string | null;
  } | null;
  template: string | null;
  /** Contenido de la obra: "pbn" (coloreable) o "print" (arte terminado); null = sin asignar. */
  artKind: string | null;
  fulfillmentMethod: string;
  isPaintByNumbers: boolean;
  isCreditPack: boolean;
  /**
   * Es un accesorio (pincel, caballete…). Lo declara el metafield
   * `custom.art_kind` de Shopify y solo lo escribe el sync: en el admin es de
   * solo lectura. Decide la tabla en la que cae el producto y que su OrderItem
   * entre a producción directo en `draft`.
   */
  isAccessory: boolean;
  showcaseCollectionHandle: string | null;
}

export interface AdminCreditPackVariant {
  shopifyVariantId: string;
  shopifyVariantTitle: string | null;
  price: string | null;
  creditAmount: number | null;
}

export interface AdminCreditPackVariants {
  product: { id: string; displayName: string };
  variants: AdminCreditPackVariant[];
}

export interface PodConfig {
  material: string;
  type: string;
  orientation?: string;
  width: number;
  height: number;
  additional?: string[];
}

export interface AdminProductVariantLink {
  id: string; // internal ProductFormatVariant id (FK target for contextual images)
  format: { id: string; displayName: string };
  shopifyVariantId: string;
  shopifyVariantTitle: string;
  isActive: boolean;
  podProvider?: string | null;
  podConfig?: PodConfig | null;
}

export interface AdminProductUnlinkedVariant {
  shopifyVariantId: string;
  shopifyVariantTitle: string;
  shopifyVariantOption: string | null;
  reason: string;
}

export interface AdminProductVariants {
  product: { id: string; displayName: string };
  linkedVariants: AdminProductVariantLink[];
  unlinkedVariants: AdminProductUnlinkedVariant[];
}

export interface PodCatalogChoice {
  value: string;
  label: string;
  codes: string[];
}

export interface PodCatalogOptionGroup {
  key: string;
  label: string;
  control: "select" | "checkbox";
  choices: PodCatalogChoice[];
  default: string;
}

export interface PodCatalogType {
  code: string;
  label: string;
  optionGroups: PodCatalogOptionGroup[];
}

export interface PodCatalogSize {
  width: number;
  height: number;
  label: string;
}

export interface PodCatalogMaterial {
  code: string;
  label: string;
  types: PodCatalogType[];
  sizes: PodCatalogSize[];
}

export interface PodCatalog {
  materials: PodCatalogMaterial[];
}

export interface SyncStatus {
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  productsChecked: number | null;
  productsCreated: number | null;
  productsUpdated: number | null;
  productsDeactivated: number | null;
}

export interface ExpenseItem {
  id: string;
  category: string;
  provider: string | null;
  providerRef: string | null;
  amount: number;
  currency: string;
  amountBase: number | null;
  baseCurrency: string | null;
  fxRate: number | null;
  detail: Record<string, unknown> | null;
  note: string | null;
  source: string;
  orderId: string | null;
  orderItemId: string | null;
  generationId: string | null;
  createdAt: string;
}

export interface OrderExpenses {
  items: ExpenseItem[];
  summary: Record<string, { count: number; totalBase: number }>;
  grandTotal: number;
  baseCurrency: string;
}

export interface CustomerExpenses {
  byCategory: Record<string, number>;
  grandTotal: number;
  /** Nº de gastos registrados; los movimientos se piden aparte y paginados. */
  count: number;
  baseCurrency: string;
}

export interface ExpensesSummary {
  period: string;
  baseCurrency: string;
  byCategory: Record<string, { total: number; count: number }>;
  grandTotal: number;
  count: number;
}

/**
 * Los créditos traducidos a dinero, por el lado del COSTO interno: un crédito
 * se gasta en una generación, y cada generación completada deja un `Expense`,
 * así que el costo medio de esos gastos es el costo de un crédito.
 */
export interface AdminCreditEconomics {
  period: string;
  baseCurrency: string;
  /** `null` si aún no hay ninguna generación con gasto registrado. */
  unitCost: number | null;
  unitCostSampleSize: number;
  /** Si no coincide con `period`, la media se calculó sobre todo el histórico. */
  unitCostPeriod: string;
  unitCostBreakdown: { vision: number; image: number } | null;
  creditsIssued: number;
  creditsSpentNet: number;
  /** Saldo actual del conjunto de usuarios; nunca filtrado por período. */
  creditsOutstanding: number;
  outstandingLiability: number;
}

export interface AdminUserCreditEconomics {
  baseCurrency: string;
  balance: number;
  creditsSpentNet: number;
  generationCost: number;
  generationCount: number;
  avgCostPerCredit: number | null;
  /** Costo medio global: es el que valora el saldo, no la media del usuario. */
  unitCost: number | null;
  unitCostSampleSize: number;
  outstandingLiability: number;
}

export interface ProviderRate {
  id: string;
  provider: string;
  model: string;
  unit: string;
  amount: number;
  currency: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data?.data ?? data;
}

export const adminApi = {
  stats: {
    overview: () => adminFetch<OverviewStats>("/admin/stats/overview"),
  },
  styles: {
    list: () => adminFetch<AdminStyle[]>("/admin/styles"),
    getById: (id: string) => adminFetch<AdminStyle>(`/admin/styles/${id}`),
    create: (body: Partial<AdminStyle>) =>
      adminFetch<AdminStyle>("/admin/styles", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<AdminStyle>) =>
      adminFetch<AdminStyle>(`/admin/styles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      adminFetch(`/admin/styles/${id}`, { method: "DELETE" }),
    delete: (id: string, force = false) =>
      adminFetch(`/admin/styles/${id}/permanent${force ? "?force=true" : ""}`, {
        method: "DELETE",
      }),
    uploadReferenceImage: (styleId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return adminFetch<AdminStyle>(
        `/admin/styles/${styleId}/reference-image`,
        {
          method: "POST",
          body: form,
        },
      );
    },
    removeReferenceImage: (styleId: string) =>
      adminFetch<AdminStyle>(`/admin/styles/${styleId}/reference-image`, {
        method: "DELETE",
      }),
    uploadImage: (styleId: string, file: File, altImage?: string) => {
      const form = new FormData();
      form.append("file", file);
      const qs = altImage ? `?alt_image=${encodeURIComponent(altImage)}` : "";
      return adminFetch(`/admin/styles/${styleId}/images${qs}`, {
        method: "POST",
        body: form,
      });
    },
    updateImage: (
      styleId: string,
      imgId: string,
      body: { isPrimary?: boolean; orderIndex?: number; altImage?: string },
    ) =>
      adminFetch<AdminStyleImage>(`/admin/styles/${styleId}/images/${imgId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deleteImage: (styleId: string, imgId: string) =>
      adminFetch(`/admin/styles/${styleId}/images/${imgId}`, {
        method: "DELETE",
      }),
    runTestGeneration: (
      styleId: string,
      options: {
        file?: File;
        petPhotoId?: string;
        petName?: string;
        petSpecies?: string;
        petBreed?: string;
        aspectRatio?: string;
        userSelections?: Record<string, string | number>;
      },
    ) => {
      const form = new FormData();
      if (options.file) form.append("file", options.file);
      if (options.petPhotoId) form.append("petPhotoId", options.petPhotoId);
      if (options.petName) form.append("petName", options.petName);
      if (options.petSpecies) form.append("petSpecies", options.petSpecies);
      if (options.petBreed) form.append("petBreed", options.petBreed);
      if (options.aspectRatio) form.append("aspectRatio", options.aspectRatio);
      if (
        options.userSelections &&
        Object.keys(options.userSelections).length > 0
      ) {
        form.append("userSelections", JSON.stringify(options.userSelections));
      }
      return adminFetch<{ generationId: string; status: string }>(
        `/admin/styles/${styleId}/test-generation`,
        { method: "POST", body: form },
      );
    },
    testGenerationStatus: (generationId: string) =>
      adminFetch<{
        status: string;
        progress: number | null;
        errorMessage: string | null;
      }>(`/generations/${generationId}/status`),
    getImageGeneration: (styleId: string, imageId: string) =>
      adminFetch<{ generation: AdminImageGeneration | null }>(
        `/admin/styles/${styleId}/images/${imageId}/generation`,
      ),
  },
  pets: {
    list: () => adminFetch<AdminPet[]>("/pets"),
    create: (body: {
      name: string;
      species: string;
      breed?: string;
      age?: number;
      description?: string;
    }) =>
      adminFetch<AdminPet>("/pets", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    uploadPhoto: (petId: string, file: File, isPrimary = false) => {
      const form = new FormData();
      form.append("photo", file);
      const qs = isPrimary ? "?isPrimary=true" : "";
      return adminFetch<AdminPetPhoto>(`/pets/${petId}/photos${qs}`, {
        method: "POST",
        body: form,
      });
    },
    deletePhoto: (petId: string, photoId: string) =>
      adminFetch(`/pets/${petId}/photos/${photoId}`, { method: "DELETE" }),
  },
  strategies: {
    list: () => adminFetch<string[]>("/admin/strategies"),
  },
  visionConfigs: {
    list: () => adminFetch<AdminVisionConfig[]>("/admin/vision-configs"),
    getById: (id: string) =>
      adminFetch<AdminVisionConfig>(`/admin/vision-configs/${id}`),
    create: (body: Partial<AdminVisionConfig>) =>
      adminFetch<AdminVisionConfig>("/admin/vision-configs", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<AdminVisionConfig>) =>
      adminFetch<AdminVisionConfig>(`/admin/vision-configs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string, force = false) =>
      adminFetch(`/admin/vision-configs/${id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      }),
    getStyles: (id: string) =>
      adminFetch<AdminConfigStyleUsage[]>(`/admin/vision-configs/${id}/styles`),
  },
  imageGenConfigs: {
    list: () => adminFetch<AdminImageGenConfig[]>("/admin/image-gen-configs"),
    getById: (id: string) =>
      adminFetch<AdminImageGenConfig>(`/admin/image-gen-configs/${id}`),
    create: (body: Partial<AdminImageGenConfig>) =>
      adminFetch<AdminImageGenConfig>("/admin/image-gen-configs", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<AdminImageGenConfig>) =>
      adminFetch<AdminImageGenConfig>(`/admin/image-gen-configs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string, force = false) =>
      adminFetch(
        `/admin/image-gen-configs/${id}${force ? "?force=true" : ""}`,
        {
          method: "DELETE",
        },
      ),
    getStyles: (id: string) =>
      adminFetch<AdminConfigStyleUsage[]>(
        `/admin/image-gen-configs/${id}/styles`,
      ),
  },
  formats: {
    list: () => adminFetch<AdminFormat[]>("/admin/formats"),
    create: (body: {
      name: string;
      displayName: string;
      aspectRatio: string;
      width: number;
      height: number;
      shopifyVariantOption?: string;
    }) =>
      adminFetch<AdminFormat>("/admin/formats", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<AdminFormat>) =>
      adminFetch<AdminFormat>(`/admin/formats/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      adminFetch(`/admin/formats/${id}`, { method: "DELETE" }),
  },
  products: {
    list: () => adminFetch<AdminProduct[]>("/admin/products"),
    getById: (id: string) => adminFetch<AdminProduct>(`/admin/products/${id}`),
    getVariants: (id: string) =>
      adminFetch<AdminProductVariants>(`/admin/products/${id}/variants`),
    update: (id: string, body: Partial<AdminProduct>) =>
      adminFetch<AdminProduct>(`/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    /** Fija EL producto dedicado al kit PBN (o ninguno si es null). Garantiza unicidad en backend. */
    setPbn: (productId: string | null) =>
      adminFetch<void>("/admin/products/pbn", {
        method: "PATCH",
        body: JSON.stringify({ productId }),
      }),
    /** Fija EL producto dedicado al pack de créditos (o ninguno si es null). */
    setCreditPack: (productId: string | null) =>
      adminFetch<void>("/admin/products/credit-pack", {
        method: "PATCH",
        body: JSON.stringify({ productId }),
      }),
    getCreditPackVariants: (id: string) =>
      adminFetch<AdminCreditPackVariants>(
        `/admin/products/${id}/credit-pack-variants`,
      ),
    setCreditPackVariants: (
      id: string,
      body: { variants: { shopifyVariantId: string; creditAmount: number }[] },
    ) =>
      adminFetch<{ shopifyVariantId: string; creditAmount: number }[]>(
        `/admin/products/${id}/credit-pack-variants`,
        { method: "PUT", body: JSON.stringify(body) },
      ),
    deactivate: (id: string) =>
      adminFetch(`/admin/products/${id}`, { method: "DELETE" }),
    delete: (id: string) =>
      adminFetch(`/admin/products/${id}/permanent`, { method: "DELETE" }),
    linkVariant: (
      productId: string,
      body: {
        shopifyVariantId: string;
        shopifyVariantTitle: string;
        formatId: string;
        shopifyVariantOption?: string | null;
      },
    ) =>
      adminFetch(`/admin/products/${productId}/variants/link`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    syncVariants: (id: string) =>
      adminFetch<{ synced: number; skipped: number }>(
        `/admin/products/${id}/variants/sync`,
        { method: "POST" },
      ),
    updateVariant: (
      productId: string,
      shopifyVariantId: string,
      body: {
        formatId?: string;
        isActive?: boolean;
        podProvider?: string | null;
        podConfig?: PodConfig | null;
      },
    ) =>
      adminFetch<AdminProductVariantLink>(
        `/admin/products/${productId}/variants/${shopifyVariantId}`,
        { method: "PATCH", body: JSON.stringify(body) },
      ),
  },
  sync: {
    trigger: () => adminFetch("/admin/products/sync", { method: "POST" }),
    status: () => adminFetch<SyncStatus>("/admin/products/sync/status"),
    history: (page = 1) =>
      adminFetch(`/admin/products/sync/history?page=${page}&limit=10`),
  },
  users: {
    list: (
      params: {
        page?: number;
        search?: string;
        sort?: string;
        order?: "asc" | "desc";
        /** Sin este parámetro el backend oculta las cuentas dadas de baja. */
        status?: AdminUserStatus | "all";
      } = {},
    ): Promise<Paginated<AdminUserListItem>> => {
      const p = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: "20",
      });
      if (params.search) p.set("search", params.search);
      if (params.sort) p.set("sort", params.sort);
      if (params.order) p.set("order", params.order);
      if (params.status) p.set("status", params.status);
      return adminFetch<Paginated<AdminUserListItem>>(`/admin/users?${p}`);
    },
    detail: (id: string) => adminFetch<AdminUserDetail>(`/admin/users/${id}`),
    generations: (
      id: string,
      page = 1,
    ): Promise<Paginated<AdminUserGeneration>> =>
      adminFetch<Paginated<AdminUserGeneration>>(
        `/admin/users/${id}/generations?page=${page}&limit=24`,
      ),
    orders: (
      id: string,
      page = 1,
    ): Promise<Paginated<AdminUserOrderListItem>> =>
      adminFetch<Paginated<AdminUserOrderListItem>>(
        `/admin/users/${id}/orders?page=${page}&limit=10`,
      ),
    paintByNumbers: (id: string, page = 1): Promise<Paginated<AdminUserPbn>> =>
      adminFetch<Paginated<AdminUserPbn>>(
        `/admin/users/${id}/paint-by-numbers?page=${page}&limit=24`,
      ),
    creditTransactions: (
      id: string,
      page = 1,
      sort?: { sort?: string; order?: "asc" | "desc" },
    ): Promise<Paginated<AdminCreditTransaction>> => {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (sort?.sort) p.set("sort", sort.sort);
      if (sort?.order) p.set("order", sort.order);
      return adminFetch<Paginated<AdminCreditTransaction>>(
        `/admin/users/${id}/credit-transactions?${p}`,
      );
    },
    expenses: (id: string) =>
      adminFetch<CustomerExpenses>(`/admin/users/${id}/expenses`),
    expenseItems: (id: string, page = 1): Promise<Paginated<ExpenseItem>> =>
      adminFetch<Paginated<ExpenseItem>>(
        `/admin/users/${id}/expenses/items?page=${page}&limit=20`,
      ),
    grantCredits: (
      id: string,
      body: { amount: number; note?: string },
    ): Promise<{ granted: boolean; balance: number }> =>
      adminFetch<{ granted: boolean; balance: number }>(
        "/admin/credits/grant",
        {
          method: "POST",
          body: JSON.stringify({ userId: id, ...body }),
        },
      ),
    /** Suspender, reactivar o desactivar. Cerrar la cuenta revoca sus sesiones. */
    setStatus: (
      id: string,
      body: { status: Exclude<AdminUserStatus, "deleted">; reason?: string },
    ): Promise<AdminUserStatusSummary> =>
      adminFetch<AdminUserStatusSummary>(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    /** Baja lógica: el PII se anonimiza 30 días después. */
    softDelete: (
      id: string,
      body: { reason: string },
    ): Promise<AdminUserStatusSummary> =>
      adminFetch<AdminUserStatusSummary>(`/admin/users/${id}`, {
        method: "DELETE",
        body: JSON.stringify(body),
      }),
    restore: (id: string): Promise<AdminUserStatusSummary> =>
      adminFetch<AdminUserStatusSummary>(`/admin/users/${id}/restore`, {
        method: "POST",
      }),
  },
  orders: {
    list: (
      params: {
        page?: number;
        limit?: number;
        status?: string;
        method?: string;
        fulfillmentStatus?: string;
        dateFrom?: string;
        dateTo?: string;
        q?: string;
        sort?: string;
        order?: "asc" | "desc";
      } = {},
    ): Promise<Paginated<AdminOrderListItem>> => {
      const p = new URLSearchParams();
      if (params.page) p.set("page", String(params.page));
      if (params.limit) p.set("limit", String(params.limit));
      if (params.status) p.set("status", params.status);
      if (params.method) p.set("method", params.method);
      if (params.fulfillmentStatus)
        p.set("fulfillmentStatus", params.fulfillmentStatus);
      if (params.dateFrom) p.set("dateFrom", params.dateFrom);
      if (params.dateTo) p.set("dateTo", params.dateTo);
      if (params.q) p.set("q", params.q);
      if (params.sort) p.set("sort", params.sort);
      if (params.order) p.set("order", params.order);
      return adminFetch<Paginated<AdminOrderListItem>>(`/admin/orders?${p}`);
    },
    detail: (id: string) => adminFetch<AdminOrderDetail>(`/admin/orders/${id}`),
    stats: (period?: "7d" | "30d" | "90d") =>
      adminFetch<OrderStats>(
        `/admin/orders/stats/summary?period=${period ?? "30d"}`,
      ),
    syncStatus: () => adminFetch(`/admin/orders/sync/status`),
    triggerSync: (since?: string) =>
      adminFetch<{ syncId: string }>("/admin/orders/sync", {
        method: "POST",
        body: JSON.stringify({ since }),
      }),
    updateItemStatus: (
      orderId: string,
      itemId: string,
      toStatus: string,
      notes?: string,
    ) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ toStatus, notes }),
      }),
    updateItemFulfillment: (
      orderId: string,
      itemId: string,
      fulfillmentMethod: "in_house" | "pod",
    ) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/fulfillment`, {
        method: "PATCH",
        body: JSON.stringify({ fulfillmentMethod }),
      }),
    resync: (orderId: string) =>
      adminFetch(`/admin/orders/${orderId}/resync`, { method: "POST" }),
    linkUser: (orderId: string, userId: string) =>
      adminFetch(`/admin/orders/${orderId}/link-user`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    cancel: (
      orderId: string,
      body: {
        itemIds?: string[];
        reason?: string;
        refund?: boolean;
        restock?: boolean;
      },
    ) =>
      adminFetch<{
        cancelledItemIds: string[];
        shopifyAction: "order_cancel" | "partial_refund";
        warnings: string[];
      }>(`/admin/orders/${orderId}/cancel`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateProductionCost: (orderId: string, productionCost: number | null) =>
      adminFetch<{ productionCost: number | null }>(
        `/admin/orders/${orderId}/production-cost`,
        { method: "PATCH", body: JSON.stringify({ productionCost }) },
      ),
    podCatalog: () => adminFetch<PodCatalog>("/admin/orders/pod/catalog"),
    podProviders: () =>
      adminFetch<{ providers: string[] }>("/admin/orders/pod/providers"),
    uploadPrintImage: (orderId: string, itemId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return adminFetch<{ printImageUrl: string }>(
        `/admin/orders/${orderId}/items/${itemId}/print-image`,
        { method: "POST", body: form },
      );
    },
    // Imagen generada del item: sobrescribe la Generation del cliente.
    uploadGenerationImage: (orderId: string, itemId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return adminFetch<{ resultUrl: string; thumbnailUrl: string }>(
        `/admin/orders/${orderId}/items/${itemId}/generation-image`,
        { method: "POST", body: form },
      );
    },
    // Guarda un PBN renderizado en el estudio y lo enlaza al item. El estudio
    // arma el FormData (svg/preview/palette/source + config).
    savePbnForItem: (orderId: string, itemId: string, form: FormData) =>
      adminFetch<{ id: string }>(
        `/admin/orders/${orderId}/items/${itemId}/paint-by-numbers`,
        { method: "POST", body: form },
      ),
    linkGeneration: (orderId: string, itemId: string, generationId: string) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/link-generation`, {
        method: "POST",
        body: JSON.stringify({ generationId }),
      }),
    unlinkGeneration: (orderId: string, itemId: string) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/unlink-generation`, {
        method: "POST",
      }),
    enhanceInfo: (orderId: string, itemId: string) =>
      adminFetch<EnhanceInfo>(
        `/admin/orders/${orderId}/items/${itemId}/enhance-info`,
      ),
    enhancePreview: (
      orderId: string,
      itemId: string,
      options: EnhanceOptions,
    ) =>
      adminFetch<{ previewUrl: string; willUpscale: boolean }>(
        `/admin/orders/${orderId}/items/${itemId}/enhance-preview`,
        { method: "POST", body: JSON.stringify(options) },
      ),
    enhance: (orderId: string, itemId: string, options: EnhanceOptions) =>
      adminFetch<{ printImageUrl: string }>(
        `/admin/orders/${orderId}/items/${itemId}/enhance`,
        { method: "POST", body: JSON.stringify(options) },
      ),
    enhanceRevert: (orderId: string, itemId: string) =>
      adminFetch<{ printImageUrl: null }>(
        `/admin/orders/${orderId}/items/${itemId}/enhance/revert`,
        { method: "POST" },
      ),
    expenses: (orderId: string) =>
      adminFetch<OrderExpenses>(`/admin/orders/${orderId}/expenses`),
    addExpense: (
      orderId: string,
      body: { amount: number; currency: string; note?: string },
    ) =>
      adminFetch<ExpenseItem>(`/admin/orders/${orderId}/expenses`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    deleteExpense: (id: string) =>
      adminFetch(`/admin/expenses/${id}`, { method: "DELETE" }),
  },
  expenses: {
    summary: (period: "7d" | "30d" | "90d" | "all" = "30d") =>
      adminFetch<ExpensesSummary>(`/admin/expenses/summary?period=${period}`),
  },
  credits: {
    economics: (period: "7d" | "30d" | "90d" | "all" = "all") =>
      adminFetch<AdminCreditEconomics>(
        `/admin/credits/economics?period=${period}`,
      ),
    userEconomics: (userId: string) =>
      adminFetch<AdminUserCreditEconomics>(
        `/admin/credits/economics/${userId}`,
      ),
  },
  expenseRates: {
    list: () => adminFetch<ProviderRate[]>("/admin/expense-rates"),
    create: (body: {
      provider: string;
      model: string;
      unit: string;
      amount: number;
      currency?: string;
    }) =>
      adminFetch<ProviderRate>("/admin/expense-rates", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      id: string,
      body: { amount?: number; unit?: string; currency?: string },
    ) =>
      adminFetch<ProviderRate>(`/admin/expense-rates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
  pbn: {
    // Full saved PBN (config + source) used to preload the studio on reopen.
    get: (id: string) =>
      adminFetch<AdminPaintByNumbers>(`/admin/paint-by-numbers/${id}`),
  },
};

export interface EnhanceOptions {
  upscaleFactor?: number;
  upscale?: 0 | 2 | 4;
  targetDpi?: number;
  sharpen?: number;
  contrast?: number;
  brightness?: number;
  saturation?: number;
  improve?: boolean;
  fitToFormat?: boolean;
  format?: "jpeg" | "png";
  bleed?: boolean;
  bleedColor?: string;
  previewUpscale?: boolean;
}

export interface EnhanceInfo {
  isPod: boolean;
  sourceUrl: string | null;
  sourcePx: { width: number; height: number } | null;
  printInches: { width: number; height: number } | null;
  sourceDpi: number | null;
  printImageUrl: string | null;
  bleedColor: string;
  recommendedUpscale: 0 | 2 | 4;
  alreadyEnhanced: boolean;
  hasUpscaledBase: boolean;
}
