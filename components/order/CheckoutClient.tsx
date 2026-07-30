"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cartTotal, readCart, writeCart, type CartItem } from "@/lib/cart";
import type { Order } from "@/types/api";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function CheckoutClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [pickupTime, setPickupTime] = useState("ASAP"); const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    setCart(readCart());
    const number = new URLSearchParams(window.location.search).get("number");
    if (number) api.getOrder(number).then((result) => setOrder(result.order)).catch((e) => setError(e.message));
  }, []);
  const total = useMemo(() => cartTotal(cart), [cart]);
  const change = (id: number, delta: number) => { const next = cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0); setCart(next); writeCart(next); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!cart.length) { setError("Your order is empty. Add something from the menu first."); return; }
    setBusy(true);
    try { const result = await api.createOrder({ customer: { name, phone }, pickupTime, notes, items: cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })) }); setOrder(result.order); writeCart([]); setCart([]); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to place your order."); }
    finally { setBusy(false); }
  };
  if (order) return <div className="confirmation"><p className="kicker">Order received</p><h1 className="display">Your number is <em>{order.orderNumber}</em></h1><p className="lead">We&apos;ll have it ready for <strong>{order.pickupTime}</strong>. Pay at pickup.</p><div className="order-summary"><strong>Status: {order.status}</strong><span>Total: {money(order.totalCents)}</span></div><a className="cta" href={`/order?number=${order.orderNumber}`}>Refresh order status ↗</a><a className="text-link" href="/menu">Back to menu</a></div>;
  return <form className="checkout-grid" onSubmit={submit}>
    <div className="checkout-fields"><a className="text-link checkout-back" href="/menu">← Back to menu</a><p className="kicker">Pickup details · Step 2 of 2</p><h1 className="display">Make it <em>yours.</em></h1><p className="lead">Review your order, choose a pickup time, and pay at the counter when you arrive.</p>
      <label>Name <span aria-hidden="true">*</span><input required autoComplete="name" minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Phone <span aria-hidden="true">*</span><input required type="tel" inputMode="tel" autoComplete="tel" minLength={7} maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label>Pickup time<select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}><option>ASAP</option><option>In 15 minutes</option><option>In 30 minutes</option><option>In 45 minutes</option></select></label>
      <label>Notes <span className="optional">Optional</span><textarea maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}<p className="payment-note"><strong>Pay at pickup.</strong> No online payment is required.</p><button className="cta submit-button" disabled={busy || !cart.length}>{busy ? "Placing order…" : "Place pickup order"}</button>
    </div>
    <aside className="cart-summary"><p className="kicker">Review your order · Step 1 of 2</p>{!cart.length && <p>Your cart is empty. <a href="/menu">Browse the menu.</a></p>}{cart.map((item) => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><span>{money(item.priceCents)} each</span></div><div className="quantity"><button type="button" aria-label={`Remove one ${item.name}`} onClick={() => change(item.id, -1)}>−</button><span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span><button type="button" aria-label={`Add one ${item.name}`} onClick={() => change(item.id, 1)}>+</button></div></div>)}<div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div></aside>
  </form>;
}
