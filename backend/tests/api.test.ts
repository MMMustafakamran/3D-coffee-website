import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { closeDatabase } from "../src/db/connection.js";

afterAll(() => closeDatabase());

describe("EMBER demo API", () => {
  it("returns the seeded menu", async () => {
    const response = await request(app).get("/api/menu");
    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(4);
    expect(response.body.categories.flatMap((category: any) => category.items)).toHaveLength(13);
  });

  it("prices and stores an order from menu ids", async () => {
    const response = await request(app).post("/api/orders").send({
      customer: { name: "Test Guest", phone: "5550100" },
      pickupTime: "ASAP",
      notes: "",
      items: [{ menuItemId: 3, quantity: 2 }],
    });
    expect(response.status).toBe(201);
    expect(response.body.order.totalCents).toBe(1000);
    const lookup = await request(app).get(`/api/orders/${response.body.order.orderNumber}`);
    expect(lookup.status).toBe(200);
    expect(lookup.body.order.items[0].quantity).toBe(2);
    expect(lookup.body.order.phone).toBeUndefined();
  });

  it("protects staff order access", async () => {
    const response = await request(app).get("/api/staff/orders");
    expect(response.status).toBe(401);
  });
});
