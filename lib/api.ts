import type { MenuResponse, Order, StaffOrder } from "@/types/api";

const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:4000/api" : "/api")).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message ?? "The service is unavailable.");
  return data as T;
}

export const api = {
  menu: () => request<MenuResponse>("/menu"),
  createOrder: (payload: unknown) => request<{ order: Order }>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (orderNumber: string) => request<{ order: Order }>(`/orders/${encodeURIComponent(orderNumber)}`),
  staffOrders: (key: string, status?: string) => request<{ orders: StaffOrder[] }>(`/staff/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`, { headers: { "X-Staff-Key": key } }),
  updateStaffStatus: (key: string, orderNumber: string, status: string) => request<{ order: Order }>(`/staff/orders/${encodeURIComponent(orderNumber)}/status`, { method: "PATCH", headers: { "X-Staff-Key": key }, body: JSON.stringify({ status }) }),
};
