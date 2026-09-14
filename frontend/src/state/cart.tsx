import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  vegetarian: boolean;
  spiceLevel: number;
  active: boolean;
};

export type CartLine = { item: MenuItem; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  remove: (menuItemId: number) => void;
  setQty: (menuItemId: number, quantity: number) => void;
  qtyOf: (menuItemId: number) => number;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'savora.cart';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore storage errors */
    }
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    function add(item: MenuItem) {
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.item.id === item.id);
        if (idx === -1) return [...prev, { item, quantity: 1 }];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      });
    }

    function remove(menuItemId: number) {
      setLines((prev) => prev.filter((l) => l.item.id !== menuItemId));
    }

    function setQty(menuItemId: number, quantity: number) {
      setLines((prev) =>
        prev
          .map((l) => (l.item.id === menuItemId ? { ...l, quantity } : l))
          .filter((l) => l.quantity > 0),
      );
    }

    function qtyOf(menuItemId: number) {
      return lines.find((l) => l.item.id === menuItemId)?.quantity ?? 0;
    }

    function clear() {
      setLines([]);
    }

    const total = lines.reduce((sum, l) => sum + Number(l.item.price) * l.quantity, 0);

    return { lines, add, remove, setQty, qtyOf, clear, total };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
