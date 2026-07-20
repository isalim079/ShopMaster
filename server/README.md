# ShopMaster Server

Express + Prisma ERP API.

## Module progress

| # | Module | Status |
|---|---|---|
| 1 | Authentication | ✅ Done |
| 2 | Users | ✅ Done |
| 3 | Roles | ✅ Done |
| 4 | Permissions | ✅ Done |
| 5 | Organization | ✅ Done |
| 6 | Settings | ✅ Done |
| 7 | Customer | ✅ Done |
| 8 | Supplier | ✅ Done |
| 9 | Brand | ✅ Done |
| 10 | Category | ✅ Done |
| 11 | Warehouse | ✅ Done |
| 12 | Product | ✅ Done |
| 13 | Inventory | ✅ Done |
| 14 | Purchase | ✅ Done |
| 15 | Purchase Return | ✅ Done |
| 16 | Sale | ✅ Done |
| 17 | Sale Return | ✅ Done |
| 18 | Payment | ✅ Done |
| 19 | Expense | ✅ Done |
| 20 | Dashboard | ✅ Done |
| 21 | Reports | ✅ Done |
| 22 | Notification | ✅ Done |
| 23 | Audit | ✅ Done |
| 24 | Upload | ✅ Done |

## Auth

Register now requires `organizationName` — creates org + user in one transaction.

## Organizations (`/api/v1/organizations`)

- `GET /me` · `PATCH /me`
- `POST /` (super admin)
- `GET /` (super admin, paginated)
- `GET /:id` · `PATCH /:id`
- `DELETE /:id` (deactivate; default org blocked)

Defaults from env: `ORGANIZATION_DEFAULT_CURRENCY`, `ORGANIZATION_DEFAULT_TIMEZONE`.

## Settings (`/api/v1/settings`)

- `GET /me` · `PATCH /me` — user theme (`LIGHT` | `DARK`)
- `GET /organization` · `PUT /organization` — list / bulk upsert org settings
- `GET /organization/:key` · `PUT /organization/:key` — single keyed setting

Permissions: `settings:read`, `settings:write`. Defaults seeded on org create / first read from env (`SETTING_DEFAULT_*`).

## Customers (`/api/v1/customers`)

- `POST /` · `GET /` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate)
- Scoped to caller organization. Permissions: `customers:read|write|delete`.

## Suppliers (`/api/v1/suppliers`)

- `POST /` · `GET /` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate)
- Scoped to caller organization. Permissions: `suppliers:read|write|delete`.

## Brands (`/api/v1/brands`)

- `POST /` · `GET /` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate)
- Unique `[organizationId, name]`. Permissions: `brands:read|write|delete`.

## Categories (`/api/v1/categories`)

- `POST /` · `GET /` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate)
- Unique `[organizationId, name]`. Optional `parentId` for tree structure. Permissions: `categories:read|write|delete`.

## Warehouses (`/api/v1/warehouses`)

- `POST /` · `GET /` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate)
- Unique `[organizationId, name]`. `isDefault` flag — setting true unsets others in same org. Permissions: `warehouses:read|write|delete`.

## Products (`/api/v1/products`)

- `POST /` · `GET /` · `GET /search` · `GET /:id` · `PATCH /:id` · `DELETE /:id` (soft deactivate) · `PATCH /:id/stock`
- Unique `[organizationId, sku]`. Validates category/brand belong to org. Optional `warehouseId` + `openingStock` on create. Permissions: `products:read|write|delete`.

## Inventory (`/api/v1/inventory`)

- `GET /` — list stocks (filters: warehouseId, productId, search, lowStock)
- `GET /history` — list movements (filters: productId, warehouseId, type)
- `POST /adjustment` — create stock adjustment (signed quantity, rejects negative result)
- Permissions: `inventory:read|write`. Uses transactions for stock changes.

## Purchases (`/api/v1/purchases`)

- `POST /` — create purchase (`DRAFT` or `ORDERED`). Computes per-line totals (`qty*unitCost - discount + tax%`). Numbered via `purchase.prefix` / `purchase.next_number` (defaults from `SETTING_DEFAULT_PURCHASE_*`).
- `GET /` — list purchases (filters: `status`, `supplierId`, `warehouseId`, `search` on number).
- `GET /:id` — purchase detail.
- `PATCH /:id` — update **draft** purchases only. Recomputes totals when `items` provided.
- `DELETE /:id` — cancel `DRAFT` or `ORDERED` purchases (blocked when any item has `receivedQty > 0`).
- `POST /:id/receive` — receive items (stock IN, `PURCHASE` movement). Transitions purchase to `PARTIAL` or `RECEIVED`.
- Validates supplier/warehouse/product belong to caller organization. Permissions: `purchases:read|write|delete`.

## Purchase Returns (`/api/v1/purchase-returns`)

- `POST /` — create return (always `COMPLETED`). Quantity ≤ received minus prior non-cancelled returns per purchase item. Stock OUT via `PURCHASE_RETURN` movement (`allowNegative: false`). Numbered via `purchase_return.prefix` / `purchase_return.next_number` (defaults from `SETTING_DEFAULT_PURCHASE_RETURN_*`).
- `GET /` — list (filters: `status`, `purchaseId`, `supplierId`, `search`).
- `GET /:id` — detail.
- Permissions: `purchase-returns:read|write|delete`.

## Sales (`/api/v1/sales`)

- `POST /` — create sale (defaults `COMPLETED`; `DRAFT` allowed). Computes per-line totals (`qty*unitPrice - discount + tax%`). Numbered via `invoice.prefix` / `invoice.next_number` (defaults from `SETTING_DEFAULT_INVOICE_*`).
- `GET /` — list sales (filters: `status`, `paymentStatus`, `customerId`, `warehouseId`, `search` on number).
- `GET /:id` — sale detail.
- `GET /:id/invoice` — printable invoice payload (customer, warehouse, lines, totals, balance due).
- `PATCH /:id` — update **draft** sales only. Recomputes totals when `items` provided.
- `POST /:id/complete` — complete draft sale (stock OUT via `SALE` movement).
- `DELETE /:id` — cancel `DRAFT` sales only.
- On `COMPLETED` (create or complete), stock is deducted honouring org setting `sale.allow_negative_stock` (falls back to env default).
- Validates customer/warehouse/product belong to caller organization. Permissions: `sales:read|write|delete`.

## Sale Returns (`/api/v1/sale-returns`)

- `POST /` — create return (always `COMPLETED`). Quantity ≤ sold minus prior non-cancelled returns per sale item. Stock IN via `SALE_RETURN` movement. Numbered via `sale_return.prefix` / `sale_return.next_number` (defaults from `SETTING_DEFAULT_SALE_RETURN_*`).
- `GET /` — list (filters: `status`, `saleId`, `customerId`, `search`).
- `GET /:id` — detail.
- Permissions: `sale-returns:read|write|delete`.

## Payments (`/api/v1/payments`)

- `POST /` · `GET /` · `GET /:id` · `DELETE /:id`
- Direction `IN`/`OUT`; links optional `saleId`/`purchaseId` and updates paid amounts + payment status.
- Permissions: `payments:read|write|delete`.

## Expenses (`/api/v1/expenses`, `/api/v1/expense-categories`)

- CRUD for categories and expenses. Permissions: `expenses:read|write|delete`.

## Dashboard (`/api/v1/dashboard`)

- `GET /summary` · `/today` · `/weekly` · `/monthly` · `/charts` · `/top-products` · `/top-customers`
- Permission: `dashboard:read`.

## Reports (`/api/v1/reports`)

- `GET /sales` · `/purchases` · `/inventory` · `/expenses` · `/profit-loss`
- Permission: `reports:read`.

## Notifications (`/api/v1/notifications`)

- `GET /` · `POST /` · `PATCH /read-all` · `PATCH /:id/read` · `DELETE /:id`
- Permissions: `notifications:read|write`.

## Audit (`/api/v1/audit-logs`)

- `GET /` with filters. Helper: `writeAuditLog`. Permission: `audit:read`.

## Uploads (`/api/v1/uploads`)

- `POST /` (multipart `file`) · `GET /` · `GET /:id` · `DELETE /:id`
- Stored under `UPLOAD_DIR`; served at `UPLOAD_STATIC_PATH`. Permissions: `uploads:read|write|delete`.

## Scripts

```bash
yarn dev
yarn build
yarn test
yarn prisma:migrate
yarn prisma:generate
yarn prisma:seed
```

## Docs

Swagger UI: `/docs`
