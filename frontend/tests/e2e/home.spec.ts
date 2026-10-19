import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Yayasan Padindi/);
  await expect(page.locator('h1')).toContainText('Beranda');
});
