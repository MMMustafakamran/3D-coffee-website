import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { seed } from "./db/seed.js";
import { menuRouter } from "./routes/menu.js";
import { ordersRouter } from "./routes/orders.js";
import { staffOrdersRouter } from "./routes/staff-orders.js";

migrate();
seed();

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.frontendOrigin, credentials: false }));
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "ember-coffee-api" }));
app.use("/api/orders", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false }), ordersRouter);
app.use("/api/menu", menuRouter);
app.use("/api/staff/orders", staffOrdersRouter);
app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found." } }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong." } });
});
