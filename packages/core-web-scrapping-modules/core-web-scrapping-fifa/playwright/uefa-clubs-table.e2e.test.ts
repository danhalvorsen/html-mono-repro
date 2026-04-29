import { test, expect } from '@playwright/test';
import { UefaClubsStatsPage } from '../src/Pages/UefaClubsStatsPage.js';

test('UEFA Clubs Stats Page - fetch table as JSON', async ({ page }) => {
  const statsPage = new UefaClubsStatsPage(page);
  await statsPage.goto();
  // Wait for network to be idle and table to be visible (robust dynamic wait)
  await page.waitForLoadState('networkidle', { timeout: 20000 });
  await expect(statsPage.table).toBeVisible({ timeout: 20000 });

  // Check that getTableDataAsJson exists and is a function
  expect(typeof statsPage.getTableDataAsJson).toBe('function');

  // Call the method and check the result
  const data = await statsPage.getTableDataAsJson();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
  expect(typeof data[0]).toBe('object');
  // Optionally check for some expected keys
  expect(Object.keys(data[0]).length).toBeGreaterThan(0);
});
