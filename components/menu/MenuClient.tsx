"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cartTotal, readCart, writeCart, type CartItem } from "@/lib/cart";
import type { MenuCategory, MenuItem } from "@/types/api";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function MenuClient() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const load = () => { setLoading(true); setError(""); api.menu().then((data) => setCategories(data.categories)).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { setCart(readCart()); load(); }, []);
  const add = (item: MenuItem) => {
    const next = cart.some((entry) => entry.id === item.id) ? cart.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.min(10, entry.quantity + 1) } : entry) : [...cart, { ...item, quantity: 1 }];
    setCart(next); writeCart(next); setAnnouncement(`${item.name} added to your order.`);
  };
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    {!loading && !error && <nav className="category-nav" aria-label="Menu categories">{categories.map((category) => <a key={category.id} href={`#category-${category.id}`}>{category.name}</a>)}</nav>}
    <div className="order-toolbar"><span>{count ? `${count} item${count === 1 ? "" : "s"} · ${money(cartTotal(cart))}` : "Choose an item to start your pickup order"}</span>{count ? <a className="navcta" href="/order">Review order</a> : <span className="navcta navcta-disabled" aria-disabled="true">Cart empty</span>}</div>
    {loading && <p className="api-state">Loading today&apos;s menu…</p>}
    {error && <div className="api-state api-error"><p>{error}</p><button className="text-button" onClick={load}>Try again</button></div>}
    {!loading && !error && categories.map((category) => <div className="menu-category" id={`category-${category.id}`} key={category.id}>
      <h2 className="menu-category-title">{category.name}</h2>
      <div className="menu-list">{category.items.map((item) => <div className={`menu-row ${!item.isAvailable ? "menu-row-soldout" : ""}`} key={item.id}>
        <div><strong>{item.name}</strong><span className="menu-desc">{item.description}</span></div>
        <div className="menu-action"><span className="menu-price">{money(item.priceCents)}</span>{item.isAvailable ? <button className="add-button" onClick={() => add(item)} aria-label={`Add ${item.name} to order`}>Add</button> : <span className="soldout">Sold out</span>}</div>
      </div>)}</div>
    </div>)}
  </>;
}
