import { test, expect } from '@playwright/test';

test.describe('Question Bank Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bank');
    await page.waitForTimeout(3000);
  });

  test('should load question bank page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('should have interactive elements', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
