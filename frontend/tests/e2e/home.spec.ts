import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, '../../../docs/design/screenshots');

test.describe('Landing Page Yayasan Padindi (E2E & Visual Verification)', () => {
  test('US-L1 s.d. US-L6: Desktop 1280px screenshot, section order, carousel, and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Tunggu konten dimuat
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tentang yayasan', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visi dan misi', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kegiatan', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hubungi kami', exact: true })).toBeVisible();

    // Pastikan tidak ada horizontal scrollbar
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verifikasi urutan section
    const headings = await page.$$eval('h1, h2', (elements) =>
      elements.map((el) => el.textContent?.trim()),
    );
    expect(headings[0]).toContain('Menuntun setiap anak');
    expect(headings[1]).toBe('Tentang yayasan');
    expect(headings[2]).toBe('Visi dan misi');
    expect(headings[3]).toBe('Kegiatan');
    expect(headings[4]).toBe('Hubungi kami');

    // Verifikasi tombol panah carousel berfungsi
    const nextBtn = page.getByRole('button', { name: 'Kegiatan berikutnya' });
    if (await nextBtn.isVisible()) {
      await expect(page.getByRole('button', { name: 'Kegiatan sebelumnya' })).toBeDisabled();
      await nextBtn.click();
      await page.waitForTimeout(400); // tunggu scroll selesai
      await expect(page.getByRole('button', { name: 'Kegiatan sebelumnya' })).toBeEnabled();
    }

    // Verifikasi tombol "Buka di Google Maps"
    await expect(page.getByRole('link', { name: /Buka di Google Maps/i })).toBeVisible();

    // Screenshot Desktop
    await page.screenshot({
      path: path.join(screenshotsDir, 'desktop-1280.png'),
      fullPage: true,
    });
  });

  test('US-L6: Tablet 768px screenshot and responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Cek tidak ada horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Screenshot Tablet
    await page.screenshot({
      path: path.join(screenshotsDir, 'tablet-768.png'),
      fullPage: true,
    });
  });

  test('US-L1, US-L6: Mobile 375px screenshot, menu mobile, and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Cek tidak ada horizontal overflow pada 375px
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verifikasi menu mobile
    const menuBtn = page.getByRole('button', { name: /Buka menu navigasi/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await expect(page.getByRole('navigation', { name: 'Menu navigasi mobile' })).toBeVisible();

    // Screenshot Mobile
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-375.png'),
      fullPage: true,
    });
  });
});
