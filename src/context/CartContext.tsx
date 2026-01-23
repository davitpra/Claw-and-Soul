"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  subtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("claw_soul_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("claw_soul_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: CartItem) => {
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

  const updateQuantity = (variantId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
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
