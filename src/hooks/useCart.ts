"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string | number;
  variantId: string;
  name: string;
  size?: string;
  style?: string;
  price: number;
  quantity: number;
  img: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("claw_soul_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("claw_soul_cart", JSON.stringify(items));
    }
  }, [items, loading]);

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

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
  };
}
