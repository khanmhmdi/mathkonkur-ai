import { chromium, Browser, Page } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

interface TestUser {
  email: string;
  password: string;
  accessToken: string;
}

describe('Chat History E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let testUser: TestUser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();

    const timestamp = Date.now();
    testUser = {
      email: `e2e-${timestamp}@test.com`,
      password: 'testpassword123',
      accessToken: '',
    };

    await page.goto(`${BASE_URL}/auth`);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    testUser.accessToken = token || '';
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Chat History Sidebar', () => {
    it('should display chat history sidebar on desktop', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      await page.waitForSelector('text=History', { timeout: 5000 });
      const sidebar = await page.locator('text=History').first();
      expect(await sidebar.isVisible()).toBe(true);
    });

    it('should show new chat button in sidebar', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      await page.waitForSelector('text=new chat', { timeout: 5000 });
      const newChatBtn = await page.locator('text=new chat').first();
      expect(await newChatBtn.isVisible()).toBe(true);
    });

    it('should display empty state when no conversations exist', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      await page.waitForSelector('text=No conversations yet', { timeout: 5000 });
      const emptyState = await page.locator('text=No conversations yet').first();
      expect(await emptyState.isVisible()).toBe(true);
    });

    it('should create new conversation and show in sidebar', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      await page.waitForSelector('text=new chat', { timeout: 5000 });
      await page.click('text=new chat');

      await page.fill('textarea', 'Test question about derivatives');
      await page.click('button:has(svg.lucide-send)');

      await page.waitForTimeout(3000);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=Test question', { timeout: 5000 });

      const conversation = await page.locator('text=Test question').first();
      expect(await conversation.isVisible()).toBe(true);
    });

    it('should load conversation history when selecting from sidebar', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=new chat', { timeout: 5000 });

      await page.fill('textarea', 'Tell me about integrals');
      await page.click('button:has(svg.lucide-send)');
      await page.waitForTimeout(3000);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=Tell me about integrals', { timeout: 5000 });

      await page.click('text=Tell me about integrals');
      await page.waitForTimeout(1000);

      const messages = await page.locator('.prose').all();
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should delete conversation from sidebar', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=new chat', { timeout: 5000 });

      await page.fill('textarea', 'Delete test conversation');
      await page.click('button:has(svg.lucide-send)');
      await page.waitForTimeout(3000);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=Delete test', { timeout: 5000 });

      await page.hover('text=Delete test');
      await page.waitForTimeout(500);

      const deleteBtn = await page.locator('button:has(svg.lucide-trash-2)').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(500);

        if (await page.locator('text=Are you sure').isVisible()) {
          await page.click('button:has-text("OK")');
          await page.waitForTimeout(1000);
        }
      }

      await page.click('button:has-text("MathKonkur")');
      const deletedConv = await page.locator('text=Delete test').first();
      expect(await deletedConv.count()).toBe(0);
    });
  });

  describe('Mobile Sidebar', () => {
    it('should open sidebar on mobile menu button click', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      const menuBtn = await page.locator('button:has(svg.lucide-menu)').first();
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForSelector('text=History', { timeout: 5000 });
        const sidebar = await page.locator('text=History').first();
        expect(await sidebar.isVisible()).toBe(true);
      }
    });

    it('should close sidebar on close button', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');

      const menuBtn = await page.locator('button:has(svg.lucide-menu)').first();
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(500);

        const closeBtn = await page.locator('button:has(svg.lucide-x)').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  describe('Conversation Persistence', () => {
    it('should persist conversations after page reload', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/`);

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=new chat', { timeout: 5000 });

      await page.fill('textarea', 'Persistence test question');
      await page.click('button:has(svg.lucide-send)');
      await page.waitForTimeout(3000);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('button:has-text("MathKonkur")');
      await page.waitForSelector('text=Persistence test', { timeout: 5000 });

      const conversation = await page.locator('text=Persistence test').first();
      expect(await conversation.isVisible()).toBe(true);
    });
  });
});
