// import { test, expect } from '@playwright/test';
// import { UefaClubsStatsPage } from '../src/Pages/UefaClubsStatsPage';

// // Integration test: fetches the table as JSON using the Page Object

// test('UEFA Clubs Stats Page - fetch table as JSON', async ({ page }) => {
//   const statsPage = new UefaClubsStatsPage(page);
//   await statsPage.goto();
//   // Wait for table to load
//   await expect(statsPage.table).toBeVisible();
//   // Optionally, click a stats button (e.g., Key stats)
//   // await statsPage.clickKeyStats();

//   // Capture console output
//   const logs: string[] = [];
//   page.on('console', msg => {
//     if (msg.type() === 'log') logs.push(msg.text());
//   });

//   await statsPage.logTableDataAsJson();

//   // Wait for the log to be captured
//   await page.waitForTimeout(1000);

//   // Parse the last log as JSON
//   const lastLog = logs[logs.length - 1];
//   expect(() => JSON.parse(lastLog)).not.toThrow();
//   const data = JSON.parse(lastLog);
//   expect(Array.isArray(data)).toBe(true);
//   expect(data.length).toBeGreaterThan(0);
//   expect(typeof data[0]).toBe('object');
//   // Optionally, check for expected columns
//   // expect(Object.keys(data[0])).toContain('Club');

// // ...existing code...
// import { test, expect } from '@playwright/test';
// import { UefaClubsStatsPage } from '../src/Pages/UefaClubsStatsPage';

// // Integration test: fetches the table as JSON using the Page Object

// test('UEFA Clubs Stats Page - fetch table as JSON', async ({ page }) => {
//   const statsPage = new UefaClubsStatsPage(page);
//   await statsPage.goto();
//   // Wait for table to load
//   await expect(statsPage.table).toBeVisible();
//   // Optionally, click a stats button (e.g., Key stats)
//   // await statsPage.clickKeyStats();

//   // Capture console output
//   const logs: string[] = [];
//   page.on('console', msg => {
//     if (msg.type() === 'log') logs.push(msg.text());
//   });

//   await statsPage.logTableDataAsJson();

//   // Wait for the log to be captured
//   await page.waitForTimeout(1000);

//   // Parse the last log as JSON
//   const lastLog = logs[logs.length - 1];
//   expect(() => JSON.parse(lastLog)).not.toThrow();
//   const data = JSON.parse(lastLog);
//   expect(Array.isArray(data)).toBe(true);
//   expect(data.length).toBeGreaterThan(0);
//   expect(typeof data[0]).toBe('object');
//   // Optionally, check for expected columns
//   // expect(Object.keys(data[0])).toContain('Club');
