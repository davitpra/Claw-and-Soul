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
  // El cliente ve el estado de fulfillment de Shopify a nivel ORDEN (ver
  // fulfillmentDisplayStatus), no estado por item. Aquí solo van datos de display.
  imageUrl: string | null;
  generation: { resultUrl: string | null; thumbnailUrl: string | null } | null;
  // Imagen primaria del estilo del producto (catálogo). Último fallback cuando el
  // item no trae arte de IA ni imageUrl propio — p. ej. productos sin generación.
  productImageUrl: string | null;
  // Datos de Shopify para resolver la imagen live del producto cuando no hay
  // ninguna imagen persistida (accesorios sin estilo). Mismo mecanismo que el admin.
  shopifyHandle: string | null;
  shopifyVariantId: string | null;
}

export interface UserOrderListItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  financialStatus: string | null;
  // Estado simple de fulfillment de Shopify (unfulfilled|partial|fulfilled|restocked).
  fulfillmentStatus: string | null;
  // Estado de fulfillment "display" derivado de los FulfillmentOrders de Shopify,
  // fiel a lo que ve el admin (in_progress|on_hold|scheduled|...). Es lo que muestra
  // el badge del cliente; puede ser null en órdenes viejas sin resync (→ fallback).
  fulfillmentDisplayStatus: string | null;
  // Página de estado del pedido en Shopify (envío + tracking nativos del cliente).
  // Puede ser null en pedidos de prueba/borrador.
  orderStatusUrl: string | null;
  shopifyCreatedAt: string;
  items: OrderItemThumb[];
}

// Respuesta de GET /orders/:id (user-scoped). Igual que la fila de lista pero con
// desglose de totales, dirección de envío y nota del cliente. Los items tienen un
// shape ligero (OrderItemThumb): solo título e imagen — el estado lo da Shopify a
// nivel orden (fulfillmentDisplayStatus / orderStatusUrl), no por item.
// Forma verificada contra la respuesta real del backend.
export interface UserOrderDetail extends UserOrderListItem {
  userId?: string;
  subtotalAmount: number;
  shippingAmount: number | null;
  taxAmount: number | null;
  shippingAddress: Address | null;
  customerNote: string | null;
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
  // Medio de la generación ("image" | "video"), NO el producto. El tipo de
  // producto sale de `productRef` (template + artKind).
  type: string;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  pet: { id: string; name: string; species?: string } | null;
  style: { id: string; displayName?: string } | null;
  // Producto para el que se pidió la obra. null en generaciones legacy previas a
  // que `productRefId` fuera obligatorio al crear.
  productRef: {
    id: string;
    displayName?: string;
    template?: string | null;
    artKind?: string | null;
  } | null;
}

// Respuesta de GET /generations/:id (user-scoped). El backend proyecta la
// Generation con USER_GENERATION_SELECT: el prompt engineering (prompt,
// negativePrompt, finalPrompt, provider, promptSnapshot, visionAnalysis…) es IP
// del negocio y NO sale de las rutas admin — no lo agregues aquí.
export interface UserGenerationDetail extends UserGeneration {
  errorMessage: string | null;
  isFavorite: boolean;
  isPublic: boolean;
  completedAt: string | null;
  formatId: string | null;
  productRefId: string | null;
  pet: { id: string; name: string; species?: string; breed?: string | null } | null;
  style: { id: string; displayName?: string; category?: string } | null;
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
