import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    { command: 'pnpm --filter @commerce/api start', port: 4000, reuseExistingServer: true, env: { DATABASE_URL: 'postgresql://commerce:commerce@localhost:5432/commerce?schema=public', REDIS_URL: 'redis://localhost:6379', JWT_ACCESS_SECRET: 'development-access-secret-at-least-32-chars', JWT_REFRESH_SECRET: 'development-refresh-secret-at-least-32-chars', PAYMENT_WEBHOOK_SECRET: 'development-payment-secret' } },
    { command: 'pnpm --filter @commerce/storefront start', port: 3000, reuseExistingServer: true, env: { NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1' } },
    { command: 'pnpm --filter @commerce/backoffice start', port: 3001, reuseExistingServer: true, env: { NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1' } },
  ],
});
