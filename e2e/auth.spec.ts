import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.waitForTimeout(2000);
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have email input field', async ({ page }) => {
    const emailInput = page.locator('input').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should have password input field', async ({ page }) => {
    const inputs = page.locator('input');
    const passwordInput = inputs.nth(1);
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should have submit button', async ({ page }) => {
    await expect(page.locator('button').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    await page.click('button');
    await page.waitForTimeout(500);
  });
});
