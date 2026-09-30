# Commerce platform architecture

## Boundaries

- `apps/storefront`: public catalog and customer account. Server components fetch indexable catalog data; client components own cart and account interactions.
- `apps/backoffice`: authenticated operations UI. Every privileged server action is also enforced by API RBAC.
- `apps/api`: NestJS modular monolith. Controllers translate HTTP, services coordinate use cases, repositories isolate Prisma access, and domain rules stay server-side.
- `packages/shared-types`: transport contracts and shared enums only.
- `packages/ui`: accessible presentational primitives with no business dependencies.
- `packages/config`: shared TypeScript and ESLint conventions.

## Transaction and trust model

The API is authoritative for prices, discounts, stock, order totals, roles, and state transitions. Checkout runs in a serializable database transaction: lock/check stock, price active variants from the database, create the order, record reservations and stock movements, and clear the cart. Payment attempts and webhooks use unique idempotency keys. Card data is never accepted or persisted.

Inventory is represented by an aggregate row per variant and an immutable stock-movement ledger. Available quantity is `onHand - reserved`. Payment is behind a provider interface; the included manual development provider is not an external payment integration.

## Delivery phases

1. Workspace, deployment boundaries, shared contracts, database model, and local infrastructure.
2. Authentication, RBAC, products/categories, and inventory APIs.
3. Cart, transactional checkout, orders, provider abstraction, webhooks, and queues.
4. Storefront experience with SSR metadata and complete UI states.
5. Back office, CRM, analytics, SEO, staff administration, and audit trails.
6. Unit/integration/e2e coverage, hardening, observability, and deployment documentation.

## Future expansion

Business-owned rows include a `tenantId` boundary from the first schema. The first release resolves a single configured tenant; later releases can replace that resolver without splitting the transactional model or changing public IDs.
