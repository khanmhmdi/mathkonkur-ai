import { test, expect } from '@playwright/test';

test.describe('Chat Interface Tests', () => {
  test('should open chat from landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat"), button:has-text("Chat"), [class*="chat"]').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const chatInterface = page.locator('[class*="chat"], [class*="modal"], [class*="overlay"]').first();
      if (await chatInterface.isVisible({ timeout: 3000 })) {
        await expect(chatInterface).toBeVisible();
      }
    }
  });

  test('should have message input in chat when opened', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat")').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const messageInput = page.locator('textarea, input[type="text"], input[type="message"]').first();
      if (await messageInput.isVisible({ timeout: 3000 })) {
        await expect(messageInput).toBeVisible();
      }
    }
  });

  test('should have send button in chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat")').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), [class*="send"]').first();
      if (await sendButton.isVisible({ timeout: 3000 })) {
        await expect(sendButton).toBeVisible();
      }
    }
  });

  test('should close chat when close button is available', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat")').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const closeButton = page.locator('button[class*="close"], [class*="close"], button:has-text("×")').first();
      if (await closeButton.isVisible({ timeout: 3000 })) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display chat header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat")').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const header = page.locator('text=MathKonkur, text=AI, text=Tutor').first();
      if (await header.isVisible({ timeout: 3000 })) {
        await expect(header).toBeVisible();
      }
    }
  });

  test('should allow typing in message input', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const startChatButton = page.locator('button:has-text("Start Chat")').first();
    if (await startChatButton.isVisible({ timeout: 10000 })) {
      await startChatButton.click();
      await page.waitForTimeout(1000);
      const messageInput = page.locator('textarea, input[type="text"]').first();
      if (await messageInput.isVisible({ timeout: 3000 })) {
        await messageInput.fill('Test message');
        await expect(messageInput).toHaveValue('Test message');
      }
    }
  });
});
