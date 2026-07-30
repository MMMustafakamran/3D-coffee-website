import path from "node:path";
import "dotenv/config";

const root = process.cwd();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databasePath: path.resolve(root, process.env.DATABASE_PATH ?? "./data/ember-demo.sqlite"),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  staffDemoKey: process.env.STAFF_DEMO_KEY ?? "ember-demo-staff",
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}
