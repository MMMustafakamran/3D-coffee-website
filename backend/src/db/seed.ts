import { db } from "./connection.js";
import { migrate } from "./migrate.js";

const categories = [
  { slug: "espresso", name: "Espresso", sortOrder: 1 },
  { slug: "filter", name: "Filter", sortOrder: 2 },
  { slug: "cold-brew", name: "Cold Brew", sortOrder: 3 },
  { slug: "pastries", name: "Pastries", sortOrder: 4 },
];

const items = [
  ["espresso", "Espresso", "Single or double shot, pulled to order.", 350],
  ["cortado", "Cortado", "Espresso softened with warm milk, equal parts.", 450],
  ["cappuccino", "Cappuccino", "Espresso, steamed milk, a proper cap of foam.", 500],
  ["flat-white", "Flat White", "Double ristretto, microfoam, no nonsense.", 525],
  ["pour-over", "Pour Over", "Today's single-estate lot, brewed to order.", 550],
  ["batch-brew", "Batch Brew", "Our house blend, always fresh, always on.", 375],
  ["drip", "Drip", "Classic filter coffee, brewed by the pot.", 325],
  ["cold-brew", "Cold Brew", "Steeped 18 hours, served over ice.", 500],
  ["iced-latte", "Iced Latte", "Espresso, cold milk, plenty of ice.", 550],
  ["sparkling-cold-brew", "Sparkling Cold Brew", "Cold brew, soda, a citrus twist.", 600],
  ["butter-croissant", "Butter Croissant", "Baked fresh each morning.", 375],
  ["almond-financier", "Almond Financier", "Toasted almond, brown butter.", 400],
  ["banana-bread", "Banana Bread", "Studded with toasted walnuts.", 425],
] as const;

export function seed() {
  migrate();
  const insertCategory = db.prepare(`
    INSERT INTO categories (slug, name, sort_order, is_active) VALUES (@slug, @name, @sortOrder, 1)
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name, sort_order = excluded.sort_order, is_active = 1
  `);
  const getCategory = db.prepare("SELECT id FROM categories WHERE slug = ?");
  const insertItem = db.prepare(`
    INSERT INTO menu_items (category_id, slug, name, description, price_cents, is_available, sort_order)
    VALUES (@categoryId, @slug, @name, @description, @priceCents, 1, @sortOrder)
    ON CONFLICT(slug) DO UPDATE SET category_id = excluded.category_id, name = excluded.name,
      description = excluded.description, price_cents = excluded.price_cents, is_available = 1,
      sort_order = excluded.sort_order
  `);

  db.exec("BEGIN");
  try {
    categories.forEach((category) => insertCategory.run(category));
    items.forEach(([slug, name, description, priceCents], index) => {
      const categorySlug = index < 4 ? "espresso" : index < 7 ? "filter" : index < 10 ? "cold-brew" : "pastries";
      const category = getCategory.get(categorySlug) as { id: number };
      insertItem.run({ categoryId: category.id, slug, name, description, priceCents, sortOrder: index });
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seed();
  console.log("EMBER menu seeded");
}
