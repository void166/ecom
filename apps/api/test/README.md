# Integration tests

The integration suite is intentionally separated from unit tests because it requires disposable PostgreSQL and Redis services. CI should start `docker-compose.yml`, run the Prisma migrations and seed, then execute `pnpm --filter @commerce/api test:integration`.

Required flows: registration/login/refresh/revocation, concurrent inventory reservation, idempotent checkout, signed payment callbacks, and permitted order-state transitions. The database-backed cases are not reported as passing until those services are available.
