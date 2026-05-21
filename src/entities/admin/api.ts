const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { pets: number; generations: number };
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
  emailVerified: boolean;
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
  style: string | null;
  size: string | null;
  fulfillmentMethod: string;
  productionStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  trackingCarrier: string | null;
  podProvider: string | null;
  podOrderId: string | null;
  notes: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  productRef: { id: string; name: string; displayName: string; fulfillmentMethod: string } | null;
  productVariant: { id: string; shopifyVariantTitle: string } | null;
  generation: {
    id: string;
    resultUrl: string | null;
    thumbnailUrl: string | null;
    pet: { id: string; name: string; species: string } | null;
    style: { id: string; displayName: string } | null;
  } | null;
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
  currency: string;
  subtotalAmount: number;
  shippingAmount: number | null;
  taxAmount: number | null;
  totalAmount: number;
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

export interface AdminStyle {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
  previewUrl: string | null;
  createdAt: string;
  images: { id: string; imageUrl: string; isPrimary: boolean; orderIndex: number }[];
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
  style: { id: string; name: string; displayName: string; previewUrl: string | null } | null;
  productType: string | null;
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

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
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
    overview: () => adminFetch<OverviewStats>('/admin/stats/overview'),
  },
  styles: {
    list: () => adminFetch<AdminStyle[]>('/admin/styles'),
    update: (id: string, body: Partial<AdminStyle>) =>
      adminFetch<AdminStyle>(`/admin/styles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      adminFetch(`/admin/styles/${id}`, { method: 'DELETE' }),
    uploadImage: (styleId: string, file: File, caption?: string) => {
      const form = new FormData();
      form.append('file', file);
      if (caption) form.append('caption', caption);
      return adminFetch(`/admin/styles/${styleId}/images?caption=${encodeURIComponent(caption ?? '')}`, {
        method: 'POST',
        body: form,
      });
    },
  },
  formats: {
    list: () => adminFetch<AdminFormat[]>('/admin/formats'),
    update: (id: string, body: Partial<AdminFormat>) =>
      adminFetch<AdminFormat>(`/admin/formats/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      adminFetch(`/admin/formats/${id}`, { method: 'DELETE' }),
  },
  products: {
    list: () => adminFetch<AdminProduct[]>('/admin/products'),
    update: (id: string, body: Partial<AdminProduct>) =>
      adminFetch<AdminProduct>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      adminFetch(`/admin/products/${id}`, { method: 'DELETE' }),
    delete: (id: string) =>
      adminFetch(`/admin/products/${id}/permanent`, { method: 'DELETE' }),
  },
  sync: {
    trigger: () => adminFetch('/admin/products/sync', { method: 'POST' }),
    status: () => adminFetch<SyncStatus>('/admin/products/sync/status'),
    history: (page = 1) =>
      adminFetch(`/admin/products/sync/history?page=${page}&limit=10`),
  },
  users: {
    list: (page = 1, search?: string): Promise<Paginated<AdminUserListItem>> => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      return adminFetch<Paginated<AdminUserListItem>>(`/admin/users?${params}`);
    },
    detail: (id: string) =>
      adminFetch<AdminUserDetail>(`/admin/users/${id}`),
    generations: (id: string, page = 1): Promise<Paginated<AdminUserGeneration>> =>
      adminFetch<Paginated<AdminUserGeneration>>(
        `/admin/users/${id}/generations?page=${page}&limit=24`,
      ),
    orders: (id: string, page = 1): Promise<Paginated<AdminUserOrderListItem>> =>
      adminFetch<Paginated<AdminUserOrderListItem>>(
        `/admin/users/${id}/orders?page=${page}&limit=10`,
      ),
  },
  orders: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      method?: string;
      dateFrom?: string;
      dateTo?: string;
      q?: string;
    } = {}): Promise<Paginated<AdminOrderListItem>> => {
      const p = new URLSearchParams();
      if (params.page) p.set('page', String(params.page));
      if (params.limit) p.set('limit', String(params.limit));
      if (params.status) p.set('status', params.status);
      if (params.method) p.set('method', params.method);
      if (params.dateFrom) p.set('dateFrom', params.dateFrom);
      if (params.dateTo) p.set('dateTo', params.dateTo);
      if (params.q) p.set('q', params.q);
      return adminFetch<Paginated<AdminOrderListItem>>(`/admin/orders?${p}`);
    },
    detail: (id: string) => adminFetch<AdminOrderDetail>(`/admin/orders/${id}`),
    stats: (period?: '7d' | '30d' | '90d') =>
      adminFetch<OrderStats>(`/admin/orders/stats/summary?period=${period ?? '30d'}`),
    syncStatus: () => adminFetch(`/admin/orders/sync/status`),
    triggerSync: (since?: string) =>
      adminFetch<{ syncId: string }>('/admin/orders/sync', {
        method: 'POST',
        body: JSON.stringify({ since }),
      }),
    updateItemStatus: (
      orderId: string,
      itemId: string,
      toStatus: string,
      notes?: string,
    ) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ toStatus, notes }),
      }),
    updateTracking: (
      orderId: string,
      itemId: string,
      data: { trackingNumber: string; trackingUrl?: string; trackingCarrier?: string },
    ) =>
      adminFetch(`/admin/orders/${orderId}/items/${itemId}/tracking`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    resync: (orderId: string) =>
      adminFetch(`/admin/orders/${orderId}/resync`, { method: 'POST' }),
    linkUser: (orderId: string, userId: string) =>
      adminFetch(`/admin/orders/${orderId}/link-user`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
  },
};
