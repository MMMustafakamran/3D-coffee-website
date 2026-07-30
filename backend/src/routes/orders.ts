import { Router } from "express";
import { z } from "zod";
import { createOrder, getOrder } from "../services/order-service.js";

const orderSchema = z.object({
  customer: z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().min(7).max(30) }),
  pickupTime: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(300).default(""),
  items: z.array(z.object({ menuItemId: z.number().int().positive(), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
});

export const ordersRouter = Router();

ordersRouter.post("/", (req, res, next) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Please check the submitted order.", fields: parsed.error.flatten().fieldErrors } });
  try {
    const order = createOrder({ customerName: parsed.data.customer.name, phone: parsed.data.customer.phone, pickupTime: parsed.data.pickupTime, notes: parsed.data.notes, items: parsed.data.items });
    return res.status(201).json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "ITEM_UNAVAILABLE") return res.status(409).json({ error: { code: "ITEM_UNAVAILABLE", message: "One of the selected items is no longer available." } });
    if (error instanceof Error && error.message === "DUPLICATE_ITEMS") return res.status(400).json({ error: { code: "DUPLICATE_ITEMS", message: "Each menu item can appear only once." } });
    return next(error);
  }
});

ordersRouter.get("/:orderNumber", (req, res) => {
  const order = getOrder(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found." } });
  return res.json({ order });
});
