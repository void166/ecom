# Commerce Platform

A production-oriented pnpm monorepo containing a Next.js storefront, Next.js back office, NestJS API, Prisma/PostgreSQL data model, Redis/BullMQ jobs, and shared packages.

## Quick start

1. Copy `.env.example` to `.env`.
2. Run `docker compose up -d`.
3. Run `pnpm install`.
4. Run `pnpm db:generate && pnpm db:migrate && pnpm db:seed`.
5. Run `pnpm dev`.

Storefront: http://localhost:3000, back office: http://localhost:3001, API docs: http://localhost:4000/docs.

The payment layer ships with a development-only manual provider. No external provider is claimed as integrated until credentials, signed callbacks, and provider sandbox tests are supplied.

See [Architecture](docs/ARCHITECTURE.md) and [API integration status](docs/INTEGRATION_STATUS.md).
