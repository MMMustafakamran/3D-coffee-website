import { Router } from "express";
import { z } from "zod";
import { listOrders, statuses, updateStatus } from "../services/order-service.js";
import { requireStaffKey } from "../middleware/staff-key.js";

export const staffOrdersRouter = Router();
staffOrdersRouter.use(requireStaffKey);

staffOrdersRouter.get("/", (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  if (status && !statuses.includes(status as any)) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Unknown order status." } });
  res.json({ orders: listOrders(status as any) });
});

staffOrdersRouter.patch("/:orderNumber/status", (req, res) => {
  const parsed = z.object({ status: z.enum(["received", "preparing", "ready", "completed", "cancelled"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Unknown order status." } });
  try {
    const order = updateStatus(req.params.orderNumber, parsed.data.status);
    if (!order) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found." } });
    return res.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TRANSITION") return res.status(409).json({ error: { code: "INVALID_TRANSITION", message: "That status change is not allowed." } });
    throw error;
  }
});
