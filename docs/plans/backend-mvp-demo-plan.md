# EMBER Coffee Demo Backend Plan

## 1. Goal

Build a small, reliable backend demo for the existing EMBER Coffee website. The result should let a client see a real end-to-end cafe flow:

1. The menu is loaded from an API instead of being hard-coded.
2. A visitor adds menu items to an order.
3. The visitor submits a pickup order with basic contact details.
4. The backend validates, prices, and stores the order.
5. The visitor sees an order number and confirmation.
6. Cafe staff can view the demo order and move it through a few statuses.

This is a demo MVP, not a production commerce platform. It should be easy to run, easy to reset, and credible in a client presentation.

## 2. Current Project Findings

### Frontend

- Next.js 16 App Router with React 19 and TypeScript.
- Routes:
  - `/` — static marketing homepage and canvas scroll film.
  - `/menu` — 13 hard-coded products in 4 categories.
- Shared components:
  - `components/Nav.tsx`
  - `components/Footer.tsx`
  - `components/SiteScripts.tsx`
- The project uses `output: "export"` and produces static files in `out/`.
- The production Docker image serves the static export from nginx.
- There are currently no API requests, forms, cart state, authentication, or database.
- “Order ahead” only links to the homepage CTA.
- “Shop the blend” and contact-related actions use `mailto:` links.

### Important constraint

Next.js route handlers cannot be used while retaining the current fully static export. For this demo, the least disruptive design is a separate API service. The frontend remains static and calls the API over HTTP.

## 3. MVP Scope

### Must have

- Public health endpoint.
- Public menu endpoint returning active categories and available items.
- Seed data matching the current 4 categories and 13 menu items.
- Client-side cart with quantity controls.
- Pickup checkout form.
- Server-side input validation and price calculation.
- SQLite persistence for orders.
- Order confirmation response with a human-readable order number.
- Simple staff order list and status update flow.
- Local development commands for frontend and backend.
- Docker Compose demo deployment with one browser origin.
- Basic automated tests and an end-to-end smoke test.

### Explicitly out of scope

- Real card payments, Stripe, refunds, or tax integrations.
- Customer accounts, login, loyalty points, saved addresses, or order history.
- Delivery, drivers, maps, or distance calculations.
- Email, SMS, push notifications, or receipt generation.
- Inventory deduction, recipes, ingredient-level stock, or POS integration.
- Advanced product modifiers such as milk choice, cup size, or add-ons.
- A full menu-management CMS.
- Multi-location support.
- Production-grade staff identity and role management.
- Analytics dashboards.
- Cloud object storage.

These are post-demo extensions and should not delay the MVP.

## 4. Proposed Architecture

```text
Browser
  |
  | GET /, /menu, /order
  | GET/POST/PATCH /api/*
  v
nginx :80
  |-- static requests ----------> Next.js static export
  `-- /api/* -------------------> Express API :4000
                                      |
                                      v
                                  SQLite file
```

### Technology choices

- Backend runtime: Node.js 20+
- Language: TypeScript
- HTTP framework: Express
- Validation: Zod
- Database: SQLite
- SQLite library: Node 22+ built-in `node:sqlite`
- Tests: Vitest + Supertest
- API documentation: a checked-in OpenAPI YAML file or a small generated JSON endpoint
- Deployment: Docker Compose with `frontend` and `api` services

### Why this fits the demo

- It stays in the same TypeScript ecosystem as the frontend.
- SQLite needs no external database service.
- A separate API preserves the existing static-export architecture.
- nginx can expose both frontend and backend from one origin, avoiding production CORS complexity.
- The whole demo can be started and reset on a laptop.

## 5. Proposed Repository Structure

```text
3D-coffee-website-forked/
├─ app/
│  ├─ menu/page.tsx
│  ├─ order/page.tsx
│  └─ staff/orders/page.tsx
├─ components/
│  ├─ menu/MenuClient.tsx
│  ├─ order/CartDrawer.tsx
│  ├─ order/CheckoutForm.tsx
│  └─ staff/OrderQueue.tsx
├─ lib/
│  ├─ api.ts
│  ├─ money.ts
│  └─ order-cart.ts
├─ types/
│  └─ api.ts
├─ backend/
│  ├─ src/
│  │  ├─ app.ts
│  │  ├─ server.ts
│  │  ├─ config.ts
│  │  ├─ db/
│  │  │  ├─ connection.ts
│  │  │  ├─ migrate.ts
│  │  │  └─ seed.ts
│  │  ├─ routes/
│  │  │  ├─ health.ts
│  │  │  ├─ menu.ts
│  │  │  ├─ orders.ts
│  │  │  └─ staff-orders.ts
│  │  ├─ services/
│  │  │  └─ order-service.ts
│  │  └─ middleware/
│  │     ├─ errors.ts
│  │     └─ staff-key.ts
│  ├─ tests/
│  ├─ migrations/
│  ├─ data/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ Dockerfile
│  └─ .env.example
├─ docs/
│  └─ api/openapi.yaml
├─ docker-compose.yml
└─ nginx.conf
```

The exact component split can change during implementation, but the API, database, and UI responsibilities should remain separated.

## 6. Data Model

All monetary values are integer cents. The server, never the browser, calculates order totals.

### `categories`

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `slug` | text | Unique, stable API identifier |
| `name` | text | Display name |
| `sort_order` | integer | Menu ordering |
| `is_active` | integer/boolean | Hide/show category |

### `menu_items`

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `category_id` | integer | Foreign key |
| `slug` | text | Unique, stable API identifier |
| `name` | text | Display name |
| `description` | text | Short menu copy |
| `price_cents` | integer | Non-negative integer |
| `is_available` | integer/boolean | Can currently be ordered |
| `sort_order` | integer | Ordering within category |

### `orders`

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Internal primary key |
| `order_number` | text | Unique client-facing value such as `EMB-1042` |
| `customer_name` | text | Required |
| `phone` | text | Required for the demo |
| `pickup_time` | text | `ASAP` or validated ISO timestamp |
| `notes` | text | Optional, length-limited |
| `status` | text | `received`, `preparing`, `ready`, `completed`, `cancelled` |
| `subtotal_cents` | integer | Calculated by backend |
| `total_cents` | integer | Same as subtotal for MVP |
| `created_at` | text | UTC ISO timestamp |
| `updated_at` | text | UTC ISO timestamp |

### `order_items`

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `order_id` | integer | Foreign key |
| `menu_item_id` | integer | Original product reference |
| `item_name` | text | Snapshot at purchase time |
| `unit_price_cents` | integer | Snapshot at purchase time |
| `quantity` | integer | 1–10 |
| `line_total_cents` | integer | Server-calculated |

No customer table is needed because the demo has guest checkout only.

## 7. API Contract

All responses use JSON. Errors use this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted order.",
    "fields": {
      "phone": "Phone is required."
    }
  }
}
```

### `GET /api/health`

Purpose: deployment and presentation readiness check.

Response `200`:

```json
{
  "status": "ok",
  "service": "ember-coffee-api"
}
```

### `GET /api/menu`

Purpose: populate the existing menu page.

Response `200`:

```json
{
  "categories": [
    {
      "id": 1,
      "slug": "espresso",
      "name": "Espresso",
      "items": [
        {
          "id": 1,
          "slug": "espresso",
          "name": "Espresso",
          "description": "Single or double shot, pulled to order.",
          "priceCents": 350,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

Only active categories are returned. Unavailable items may remain visible with `isAvailable: false` so the UI can show “Sold out.”

### `POST /api/orders`

Purpose: validate, price, and store a pickup order.

Request:

```json
{
  "customer": {
    "name": "Alex Morgan",
    "phone": "+1 555 010 0200"
  },
  "pickupTime": "ASAP",
  "notes": "No napkins, please.",
  "items": [
    {
      "menuItemId": 3,
      "quantity": 2
    }
  ]
}
```

Rules:

- At least one item.
- Maximum 20 line items and maximum quantity 10 per item.
- Name, phone, and notes have strict length limits.
- Each item must exist and be available.
- Duplicate item IDs are combined or rejected consistently.
- Prices sent by the browser are ignored.
- The insert of the order and all order items uses one transaction.

Response `201`:

```json
{
  "order": {
    "orderNumber": "EMB-1042",
    "status": "received",
    "pickupTime": "ASAP",
    "subtotalCents": 1000,
    "totalCents": 1000,
    "createdAt": "2026-07-31T12:00:00.000Z",
    "items": [
      {
        "name": "Cappuccino",
        "unitPriceCents": 500,
        "quantity": 2,
        "lineTotalCents": 1000
      }
    ]
  }
}
```

Relevant failures:

- `400` malformed JSON or invalid fields.
- `409` item is unavailable or menu changed during checkout.
- `500` unexpected server error with no stack trace exposed.

### `GET /api/orders/:orderNumber`

Purpose: let the confirmation page retrieve a just-created order.

Response is deliberately limited to order number, status, totals, item snapshots, pickup time, and creation time. It must not expose the phone number.

For the demo, knowledge of the randomly generated order number acts as the lookup token. Production should use an explicit signed lookup token or authenticated account.

### `GET /api/staff/orders?status=received`

Purpose: populate a lightweight staff order queue.

- Protected by `X-Staff-Key`.
- Accepts an optional known status filter.
- Returns the newest 50 orders only.
- This is a demo control, not production authentication.

### `PATCH /api/staff/orders/:orderNumber/status`

Request:

```json
{
  "status": "preparing"
}
```

Allowed transitions:

```text
received -> preparing -> ready -> completed
received/preparing -> cancelled
```

Invalid transitions return `409`.

## 8. Frontend Connection Plan

### Menu page

Refactor `app/menu/page.tsx` so its visual shell and metadata remain intact while a client component:

- Calls `GET /api/menu`.
- Renders the same four category/list design from API data.
- Shows skeleton/loading text without large layout shifts.
- Shows a retry state if the API is unavailable.
- Shows “Sold out” and disables ordering for unavailable items.
- Adds an “Add” control to each available item.

The current hard-coded menu is copied into the database seed, so the initial appearance and prices do not unexpectedly change.

### Cart

Add a client-side cart drawer:

- Item quantity increment/decrement.
- Remove item.
- Display-only estimated subtotal.
- Cart item count in the navigation/order CTA.
- Persist cart in `localStorage` so refreshing the static page does not lose it.
- Treat local prices as display estimates; the confirmation uses server totals.

### Checkout

Add `/order` as a static route containing a client-side checkout form:

- Name.
- Phone.
- Pickup time: `ASAP` plus a small set of demo time slots.
- Optional notes.
- Cart summary.
- Submit to `POST /api/orders`.
- Disable repeated submission while pending.
- On `409`, refresh the menu/cart pricing and show a clear correction message.
- On success, clear the cart and render or navigate to a confirmation state.

No payment fields should be shown. The page should clearly say “Pay at pickup.”

### Confirmation

Show:

- “Order received.”
- Order number.
- Current status.
- Pickup time.
- Server-confirmed items and total.
- Link back to the menu.

Polling order status is optional for the MVP. A manual “Refresh status” button is enough and avoids unnecessary background behavior.

### Staff queue

Add `/staff/orders` as a static, client-side page:

- Ask for the demo staff key once and retain it in `sessionStorage`.
- Fetch recent orders.
- Filter by status.
- Update status using permitted transitions.
- Refresh button.
- Show connection and authorization errors clearly.

This page is for the client presentation only. It must be labeled as a demo and not represented as secure production administration.

### API base URL

Use one helper in `lib/api.ts`:

- Browser requests default to relative `/api`.
- Local development may use `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api`.
- Docker/nginx production uses relative `/api` and same-origin proxying.
- No component should hard-code a backend host.

## 9. Backend Rules and Safety

- Parse configuration once at startup and fail clearly if required values are missing.
- Enable CORS only for the local frontend origin during split local development.
- In the combined Docker demo, use same-origin requests.
- Use `helmet` for sensible HTTP headers.
- Apply JSON body size limits.
- Apply modest rate limiting to order creation.
- Validate every request with Zod.
- Return controlled public errors; log detailed errors server-side.
- Use prepared statements and transactions.
- Store prices in cents.
- Recalculate prices from the database.
- Do not log full phone numbers or staff keys.
- On shutdown, stop accepting traffic and close the database.
- Keep the SQLite database on a Docker volume so container restarts retain demo orders.

## 10. Seed Data

Create four categories in current display order:

1. Espresso
2. Filter
3. Cold Brew
4. Pastries

Seed all 13 current menu items with their existing names, descriptions, and prices. The seed must be idempotent: running it again updates or ignores known slugs rather than duplicating rows.

Provide a separate reset command for presentations:

```text
npm run db:reset
```

It should recreate the database, seed the menu, and remove old demo orders. The reset command must be clearly documented as destructive to demo data.

## 11. Configuration

Backend `.env.example`:

```dotenv
PORT=4000
NODE_ENV=development
DATABASE_PATH=./data/ember-demo.sqlite
FRONTEND_ORIGIN=http://localhost:3000
STAFF_DEMO_KEY=change-me-for-the-demo
LOG_LEVEL=info
```

Frontend optional local setting:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Secrets are never committed. The staff key is supplied through environment configuration.

## 12. Implementation Phases

### Phase 1 — Backend foundation

1. Create the `backend/` TypeScript package.
2. Add config validation, Express app factory, server entry point, error handling, health route, and structured logging.
3. Add SQLite connection and migration runner.
4. Add schema migration for categories, menu items, orders, and order items.
5. Add idempotent menu seed and database reset scripts.

Exit check:

- Backend starts with one command.
- Health returns `200`.
- A fresh database migrates and seeds successfully.

### Phase 2 — Menu API

1. Add the menu repository/query.
2. Add `GET /api/menu`.
3. Add response schemas/types.
4. Test ordering, active flags, unavailable items, and empty results.
5. Document the endpoint in OpenAPI.

Exit check:

- The API returns all 4 categories and 13 seeded items in the current UI order.

### Phase 3 — Ordering API

1. Add request validation.
2. Implement server-side item lookup and total calculation.
3. Generate non-sequential, presentation-friendly order numbers.
4. Store orders and item snapshots in one transaction.
5. Add the public order lookup endpoint.
6. Test happy path and validation, unavailable-item, tampered-price, and transaction-failure paths.

Exit check:

- A valid order is persisted and returned with correct totals.
- A browser cannot alter pricing.

### Phase 4 — Connect the public frontend

1. Add shared API types and fetch helper.
2. Replace hard-coded menu rendering with `GET /api/menu`.
3. Add cart state, `localStorage`, and accessible quantity controls.
4. Add `/order` checkout page.
5. Submit orders and show confirmation.
6. Point both “Order ahead” and the homepage primary purchase CTA into the menu/order flow.
7. Preserve existing canvas, reveal, navigation-theme, and responsive behavior.

Exit check:

- A visitor can go from the existing homepage to menu, cart, checkout, and confirmation without opening an email client.

### Phase 5 — Staff demo

1. Add staff-key middleware.
2. Add order list and status update endpoints.
3. Add transition validation.
4. Add the static `/staff/orders` client page.
5. Add endpoint and UI tests.

Exit check:

- A newly submitted public order appears in the staff queue and can be moved to “Ready.”

### Phase 6 — Packaging and demo verification

1. Add the backend Dockerfile.
2. Add Docker Compose with frontend, API, persistent SQLite volume, health checks, and startup ordering.
3. Update nginx to proxy `/api/` to the API service while keeping static caching behavior.
4. Add root-level convenience scripts or clear two-terminal development instructions.
5. Add README setup, environment, seed/reset, staff URL, and demo walkthrough.
6. Run unit, API integration, frontend build, and end-to-end smoke checks.

Exit check:

- `docker compose up --build` produces one working demo URL.
- The complete presentation flow works from a clean checkout.

## 13. Testing Plan

### Backend automated tests

- Health endpoint.
- Menu categories/items and sort order.
- Unavailable item behavior.
- Valid order creation.
- Empty cart rejection.
- Invalid quantities and oversized input rejection.
- Unknown/unavailable product rejection.
- Server ignores client-provided prices.
- Correct subtotal and item snapshot.
- Transaction rollback on insert failure.
- Public lookup does not expose phone number.
- Staff key rejection.
- Valid and invalid status transitions.

Use a temporary SQLite database per test suite.

### Frontend checks

- Menu loading, error, retry, available, and sold-out states.
- Add/remove/change cart quantities.
- Cart persistence after refresh.
- Checkout field validation.
- Pending submit prevents duplicate clicks.
- Successful confirmation clears cart.
- API conflict produces a useful message.
- Keyboard access and visible focus for new controls.

### End-to-end smoke test

1. Open the homepage and confirm the existing scroll film still initializes.
2. Click “Order ahead.”
3. Add a cappuccino and pastry.
4. Open the cart and proceed to checkout.
5. Submit a pickup order.
6. Record the order number and confirmed total.
7. Open the staff queue.
8. Find the same order and mark it `preparing`, then `ready`.
9. Refresh its public status and confirm it says `ready`.

## 14. Definition of Done

The demo MVP is complete when:

- A clean checkout can be started from documented commands.
- The homepage and current visual interactions are not regressed.
- The menu is served by the backend.
- An order can be created from the frontend and survives a page refresh/server restart.
- Totals are calculated on the server.
- A staff demo page can list the order and update its status.
- The public response does not expose sensitive contact data.
- Automated backend tests pass.
- The frontend production build passes.
- The Docker Compose demo passes the end-to-end smoke flow.
- Demo reset steps are documented.
- Out-of-scope production features have not been added.

## 15. Suggested Client Demo Script

1. Start on the existing cinematic homepage.
2. Use “Order ahead” to open the live menu.
3. Mention that availability and prices now come from the cafe API.
4. Add two items and adjust a quantity.
5. Submit a pickup order with “Pay at pickup.”
6. Show the server-issued order number.
7. Open the staff queue in a second tab.
8. Show the new order and change it to “Ready.”
9. Refresh the customer status.
10. Explain that payment, notifications, inventory, and POS integration are clear next phases after client approval.

## 16. Post-MVP Options

Only after the demo is approved:

1. Real staff authentication and roles.
2. Product/availability management.
3. Stripe or another payment provider.
4. Email/SMS status notifications.
5. Product sizes and modifiers.
6. Tax, discounts, and receipts.
7. Multiple cafe locations and location-specific menus.
8. Managed PostgreSQL and production hosting.
9. Monitoring, backups, audit logs, and privacy retention rules.
