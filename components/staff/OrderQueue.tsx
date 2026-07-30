"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { StaffOrder } from "@/types/api";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const nextStatus: Record<string, string | undefined> = { received: "preparing", preparing: "ready", ready: "completed" };

export default function OrderQueue() {
  const [key, setKey] = useState(""); const [orders, setOrders] = useState<StaffOrder[]>([]); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const load = async (provided = key) => { setLoading(true); setError(""); try { const data = await api.staffOrders(provided, status || undefined); setOrders(data.orders); sessionStorage.setItem("ember-staff-key", provided); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load orders."); } finally { setLoading(false); } };
  useEffect(() => { const saved = sessionStorage.getItem("ember-staff-key"); if (saved) { setKey(saved); load(saved); } }, []);
  const advance = async (order: StaffOrder) => { const next = nextStatus[order.status]; if (!next) return; try { await api.updateStaffStatus(key, order.orderNumber, next); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to update order."); } };
  return <div className="staff-panel"><div className="staff-tools"><label>Demo staff key<input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="ember-demo-staff" /></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option value="received">Received</option><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="completed">Completed</option></select></label><button className="text-button" disabled={!key || loading} onClick={() => load()}>Refresh</button></div>{error && <p className="form-error">{error}</p>}{!orders.length && !loading && <p className="api-state">No orders yet.</p>}{orders.map((order) => <article className="staff-order" key={order.orderNumber}><div><p className="kicker">{order.orderNumber} · {order.status}</p><h2>{order.customerName}</h2><p>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")} · {money(order.totalCents)}</p><small>{order.pickupTime} · {order.phone}</small></div>{nextStatus[order.status] && <button className="add-button" onClick={() => advance(order)}>Mark {nextStatus[order.status]}</button>}</article>)}</div>;
}
