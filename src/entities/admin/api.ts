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
  productType: { id: string; name: string; displayName: string } | null;
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
  },
};
