import crypto from "node:crypto";
import { db } from "../db/connection.js";
import type { OrderStatus } from "../types.js";

export const statuses: OrderStatus[] = ["received", "preparing", "ready", "completed", "cancelled"];
const transitions: Record<OrderStatus, OrderStatus[]> = {
  received: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

const makeOrderNumber = () => `EMB-${crypto.randomInt(1000, 9999)}`;

export function createOrder(input: {
  customerName: string;
  phone: string;
  pickupTime: string;
  notes: string;
  items: Array<{ menuItemId: number; quantity: number }>;
}) {
  const ids = [...new Set(input.items.map((item) => item.menuItemId))];
  if (ids.length !== input.items.length) throw new Error("DUPLICATE_ITEMS");
  const placeholders = ids.map(() => "?").join(",");
  const products = db.prepare(`SELECT id, name, price_cents, is_available FROM menu_items WHERE id IN (${placeholders})`).all(...ids) as Array<{
    id: number; name: string; price_cents: number; is_available: number;
  }>;
  if (products.length !== ids.length || products.some((product) => !product.is_available)) throw new Error("ITEM_UNAVAILABLE");
  const byId = new Map(products.map((product) => [product.id, product]));
  const pricedItems = input.items.map((item) => {
    const product = byId.get(item.menuItemId)!;
    return { ...item, name: product.name, unitPriceCents: product.price_cents, lineTotalCents: product.price_cents * item.quantity };
  });
  const subtotalCents = pricedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const now = new Date().toISOString();
  let orderNumber = makeOrderNumber();
  db.exec("BEGIN");
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        db.prepare(`INSERT INTO orders (order_number, customer_name, phone, pickup_time, notes, status, subtotal_cents, total_cents, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'received', ?, ?, ?, ?)`)
          .run(orderNumber, input.customerName, input.phone, input.pickupTime, input.notes, subtotalCents, subtotalCents, now, now);
        break;
      } catch (error) {
        if (attempt === 4) throw error;
        orderNumber = makeOrderNumber();
      }
    }
    const order = db.prepare("SELECT id FROM orders WHERE order_number = ?").get(orderNumber) as { id: number };
    const insertItem = db.prepare(`INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price_cents, quantity, line_total_cents) VALUES (?, ?, ?, ?, ?, ?)`);
    pricedItems.forEach((item) => insertItem.run(order.id, item.menuItemId, item.name, item.unitPriceCents, item.quantity, item.lineTotalCents));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return getOrder(orderNumber)!;
}

export function getOrder(orderNumber: string) {
  const row = db.prepare("SELECT order_number, pickup_time, status, subtotal_cents, total_cents, created_at, updated_at FROM orders WHERE order_number = ?").get(orderNumber) as any;
  if (!row) return null;
  const items = db.prepare("SELECT item_name, unit_price_cents, quantity, line_total_cents FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_number = ?)").all(orderNumber) as any[];
  return {
    orderNumber: row.order_number,
    pickupTime: row.pickup_time,
    status: row.status as OrderStatus,
    subtotalCents: row.subtotal_cents,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((item) => ({ name: item.item_name, unitPriceCents: item.unit_price_cents, quantity: item.quantity, lineTotalCents: item.line_total_cents })),
  };
}

export function listOrders(status?: OrderStatus) {
  const rows = status
    ? db.prepare("SELECT order_number, customer_name, phone, pickup_time, notes, status, subtotal_cents, total_cents, created_at, updated_at FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 50").all(status)
    : db.prepare("SELECT order_number, customer_name, phone, pickup_time, notes, status, subtotal_cents, total_cents, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT 50").all();
  return (rows as any[]).map((row) => ({ ...row, orderNumber: row.order_number, customerName: row.customer_name, pickupTime: row.pickup_time, subtotalCents: row.subtotal_cents, totalCents: row.total_cents, createdAt: row.created_at, updatedAt: row.updated_at, items: getOrder(row.order_number)?.items ?? [] }));
}

export function updateStatus(orderNumber: string, nextStatus: OrderStatus) {
  const row = db.prepare("SELECT status FROM orders WHERE order_number = ?").get(orderNumber) as { status: OrderStatus } | undefined;
  if (!row) return null;
  if (!transitions[row.status].includes(nextStatus)) throw new Error("INVALID_TRANSITION");
  const now = new Date().toISOString();
  db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE order_number = ?").run(nextStatus, now, orderNumber);
  return getOrder(orderNumber);
}
