import { expect, test } from '@playwright/test';

test('staff can authenticate and view live dashboard metrics', async ({ page }) => {
  await page.goto('http://localhost:3001/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('http://localhost:3001/');
  await expect(page.getByText('Net revenue')).toBeVisible();
  await expect(page.getByText('Attention needed')).toBeVisible();
});
