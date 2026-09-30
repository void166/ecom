import { expect, test } from '@playwright/test';

test('customer can discover a product and add it to the bag', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'All objects' })).toBeVisible();
  await page.locator('article').first().getByRole('link').first().click();
  await expect(page.getByRole('button', { name: /add to bag/i })).toBeEnabled();
  await page.getByRole('button', { name: /add to bag/i }).click();
  await expect(page.getByText('Added to bag')).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your bag' })).toBeVisible();
});

test('storefront exposes meaningful empty search state', async ({ page }) => {
  await page.goto('/products');
  await page.getByPlaceholder('Search the collection').fill('definitely-not-a-product');
  await expect(page.getByText('No objects found')).toBeVisible();
});
