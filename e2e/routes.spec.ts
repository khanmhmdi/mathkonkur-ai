import { test, expect } from '@playwright/test';

test.describe('Route Navigation Tests', () => {
  test('should load landing page at root path', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/KonkurGenius/i);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to question bank', async ({ page }) => {
    await page.goto('/bank');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to auth-test page', async ({ page }) => {
    await page.goto('/auth-test');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate from landing to bank via navbar', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/bank"]');
    await expect(page).toHaveURL(/.*\/bank/);
  });

  test('should navigate from landing to auth via navbar', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/auth"]');
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test('should navigate from landing to pricing via navbar', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL(/.*\/pricing/);
  });

  test('should handle unknown route gracefully', async ({ page }) => {
    await page.goto('/unknown-route');
    await page.waitForTimeout(1000);
  });
});
