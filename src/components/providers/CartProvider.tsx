"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  productId: string;
  sizeId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  imageUrl: string;
  quantity: number;
  unitPriceGhs: number;
  subtotalGhs: number;
  available: boolean;
};

type CartState = {
  lines: CartLine[];
  subtotalGhs: number;
  itemCount: number;
  loading: boolean;
  toast: string | null;
};

type CartContextValue = CartState & {
  refresh: () => Promise<void>;
  addItem: (productId: string, sizeId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearToast: () => void;
  openCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [subtotalGhs, setSubtotalGhs] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const applyCart = useCallback((data: { lines: CartLine[]; subtotalGhs: number; itemCount: number }) => {
    setLines(data.lines);
    setSubtotalGhs(data.subtotalGhs);
    setItemCount(data.itemCount);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success) applyCart(json.data);
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, sizeId: string, quantity = 1) => {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, sizeId, quantity }),
      });
      const json = await res.json();
      if (json.success) {
        applyCart(json.data);
        setToast(json.data.message || "Added to your order ✓");
        setCartOpen(true);
        return true;
      }
      setToast(json.message || "Could not add item.");
      return false;
    },
    [applyCart],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const res = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const json = await res.json();
      if (json.success) applyCart(json.data);
    },
    [applyCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const res = await fetch(`/api/cart/items?itemId=${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) applyCart(json.data);
    },
    [applyCart],
  );

  const value = useMemo(
    () => ({
      lines,
      subtotalGhs,
      itemCount,
      loading,
      toast,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clearToast: () => setToast(null),
      openCart: () => setCartOpen(true),
      cartOpen,
      setCartOpen,
    }),
    [lines, subtotalGhs, itemCount, loading, toast, refresh, addItem, updateQuantity, removeItem, cartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
