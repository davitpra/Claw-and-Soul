"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export interface CartItem {
  id: string | number;
  variantId: string;
  name: string;
  size?: string;
  style?: string;
  color?: string;
  price: number;
  quantity: number;
  img: string;
  generationId?: string;
  paintByNumbersId?: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  updateItemImage: (generationId: string, imageUrl: string) => void;
  subtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "claw_soul_cart";

// Backend wraps responses in { data }
type CartResponse = { data: { items: CartItem[] } };

// Strip the frontend-only `id` field before sending to the backend
// (the API rejects unknown properties).
const toPayload = (item: CartItem) => {
  const payload = { ...item } as Partial<CartItem>;
  delete payload.id;
  return payload;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { authFetchJSON } = useAuthFetch();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const prevAuthRef = useRef<boolean | null>(null);

  // Helper: call a cart endpoint and return the resulting items
  const cartRequest = async (
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<CartItem[]> => {
    const res = await authFetchJSON<CartResponse>(endpoint, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.data.items;
  };

  // Load guest cart from localStorage once on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage ONLY in guest mode (authenticated cart lives in backend)
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded, isAuthenticated]);

  // React to auth transitions: merge on login, empty on logout
  useEffect(() => {
    if (isLoading) return;

    const wasAuthenticated = prevAuthRef.current;

    if (isAuthenticated) {
      // Login or initial load while authenticated: merge guest cart + load backend cart
      void syncOnLogin();
    } else if (wasAuthenticated === true) {
      // Logout: start with an empty guest cart (the user cart stays in backend)
      setItems([]);
    }

    prevAuthRef.current = isAuthenticated;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  const syncOnLogin = async () => {
    try {
      let guestItems: CartItem[] = [];
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        try {
          guestItems = JSON.parse(saved);
        } catch {
          guestItems = [];
        }
      }

      const serverItems =
        guestItems.length > 0
          ? await cartRequest("/cart/merge", "POST", {
              items: guestItems.map(toPayload),
            })
          : await cartRequest("/cart", "GET");

      setItems(serverItems);
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (e) {
      console.error("Cart sync on login failed:", e);
    }
  };

  const addToCart = async (newItem: CartItem) => {
    if (isAuthenticated) {
      try {
        setItems(await cartRequest("/cart/items", "POST", toPayload(newItem)));
      } catch (e) {
        console.error("addToCart failed:", e);
      }
      return;
    }

    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.variantId === newItem.variantId &&
          item.style === newItem.style &&
          item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = async (variantId: string, delta: number) => {
    if (isAuthenticated) {
      try {
        setItems(
          await cartRequest(
            `/cart/items?variantId=${encodeURIComponent(variantId)}`,
            "PATCH",
            { delta }
          )
        );
      } catch (e) {
        console.error("updateQuantity failed:", e);
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = async (variantId: string) => {
    if (isAuthenticated) {
      try {
        setItems(
          await cartRequest(
            `/cart/items?variantId=${encodeURIComponent(variantId)}`,
            "DELETE"
          )
        );
      } catch (e) {
        console.error("removeItem failed:", e);
      }
      return;
    }

    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setItems(await cartRequest("/cart", "DELETE"));
      } catch (e) {
        console.error("clearCart failed:", e);
      }
      return;
    }

    setItems([]);
  };

  const updateItemImage = async (generationId: string, imageUrl: string) => {
    if (isAuthenticated) {
      try {
        setItems(
          await cartRequest("/cart/image", "PATCH", { generationId, imageUrl })
        );
      } catch (e) {
        console.error("updateItemImage failed:", e);
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.generationId === generationId && !item.imageUrl
          ? { ...item, imageUrl, img: imageUrl }
          : item
      )
    );
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        updateItemImage,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
