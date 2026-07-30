export type MenuItem = { id: number; slug: string; name: string; description: string; priceCents: number; isAvailable: boolean };
export type MenuCategory = { id: number; slug: string; name: string; items: MenuItem[] };
export type MenuResponse = { categories: MenuCategory[] };
export type OrderItem = { name: string; unitPriceCents: number; quantity: number; lineTotalCents: number };
export type Order = { orderNumber: string; pickupTime: string; status: string; subtotalCents: number; totalCents: number; createdAt: string; updatedAt: string; items: OrderItem[] };
export type StaffOrder = Order & { customerName: string; phone: string; notes: string };
