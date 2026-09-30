# REST API summary

All endpoints are under `/api/v1`. Successful responses have `{ "data": ... }`; failures have `{ "error": { "code", "message", "details?", "requestId?" } }`.

## Public and customer

- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me`
- `GET /catalog/products`, `/catalog/products/:slug`, `/catalog/categories`
- `POST /carts`; `GET /carts/:id`; `POST/PATCH/DELETE /carts/:id/items`
- `POST /checkout`
- `GET /orders/me`, `/orders/me/:id` (authenticated customer history and tracking)
- `POST /payments/webhooks/manual` (HMAC-SHA256 signature required)

## Back office

- `GET/POST /admin/products`; `POST /admin/categories`; `PUT /admin/products/:id/seo`
- `GET /admin/inventory`; `POST /admin/inventory/:variantId/adjustments`
- `GET /admin/orders`, `/admin/orders/:id`; `PATCH /admin/orders/:id/status`
- `GET /admin/customers`, `/admin/customers/:id`; `POST /admin/customers/:id/notes`, `/interactions`
- `GET /admin/analytics/dashboard`, `/admin/audit-logs`

Interactive OpenAPI documentation is served at `/docs`.
