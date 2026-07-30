import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function requireStaffKey(req: Request, res: Response, next: NextFunction) {
  if (req.header("X-Staff-Key") !== config.staffDemoKey) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "A valid staff demo key is required." } });
  next();
}
