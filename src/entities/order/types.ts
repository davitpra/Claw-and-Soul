// Tipos para el dashboard de cuenta de usuario. Reflejan las respuestas de los
// endpoints user-scoped del backend (orders / generations / users/me).

// El backend envuelve todas las respuestas con un Transform interceptor global.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Shape mínimo para el saludo y los detalles de cuenta.
export interface AccountUser {
  fullName?: string | null;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderItemThumb {
  id: string;
  title: string;
  productionStatus: string | null;
  imageUrl: string | null;
  generation: { resultUrl: string | null; thumbnailUrl: string | null } | null;
}

export interface UserOrderListItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  shopifyCreatedAt: string;
  items: OrderItemThumb[];
}

// shippingAddress se guarda como JSON libre en la orden; campos típicos abajo.
export interface Address {
  name?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
  [key: string]: string | undefined;
}

export interface DefaultAddressResponse {
  address: Address | null;
}

export interface UserGeneration {
  id: string;
  status: string;
  type: string;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  pet: { id: string; name: string; species?: string } | null;
  style: { id: string; displayName?: string } | null;
}

export interface UserPetPhoto {
  id: string;
  photoUrl: string;
  isPrimary: boolean;
}

export interface UserPet {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  description?: string | null;
  photos?: UserPetPhoto[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
