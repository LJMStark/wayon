import { test, expect } from '@playwright/test';

test('home page renders in Chinese by default', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/zh/);
  await expect(page.locator('body')).toBeVisible();
});
