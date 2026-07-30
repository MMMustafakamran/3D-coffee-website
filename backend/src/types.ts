export type OrderStatus = "received" | "preparing" | "ready" | "completed" | "cancelled";

export type MenuItem = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  isAvailable: boolean;
};
