import { Router } from "express";
import { db } from "../db/connection.js";

export const menuRouter = Router();

menuRouter.get("/", (_req, res) => {
  const categories = db.prepare("SELECT id, slug, name FROM categories WHERE is_active = 1 ORDER BY sort_order").all() as any[];
  const items = db.prepare("SELECT id, category_id, slug, name, description, price_cents, is_available FROM menu_items ORDER BY sort_order").all() as any[];
  res.json({ categories: categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    items: items.filter((item) => item.category_id === category.id).map((item) => ({ id: item.id, slug: item.slug, name: item.name, description: item.description, priceCents: item.price_cents, isAvailable: Boolean(item.is_available) })),
  })) });
});
