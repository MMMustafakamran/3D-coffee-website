import type { MenuItem } from "@/types/api";

export type CartItem = MenuItem & { quantity: number };
const key = "ember-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(key) ?? "[]") as CartItem[]; } catch { return []; }
}
export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("ember-cart-change"));
}
export function cartTotal(items: CartItem[]) { return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0); }
