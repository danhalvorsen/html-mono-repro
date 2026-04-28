import { expect, test } from "@playwright/test";

test.describe("Voice browser integration", () => {
  test("creates a voice and transitions gate state in a real browser", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#voice-state")).toHaveText("not-created");

    await page.locator("#create-voice").click();
    await expect(page.locator("#voice-state")).toHaveText("idle");
    await expect(page.locator("#voice-frequency")).toHaveText("none");
    await expect(page.locator("#voice-velocity")).toHaveText("0");

    await page.locator("#gate-on").click();
    await expect(page.locator("#voice-state")).toHaveText("active");
    await expect(page.locator("#voice-frequency")).toHaveText("440");
    await expect(page.locator("#voice-velocity")).toHaveText("0.75");

    await page.locator("#gate-off").click();
    await expect(page.locator("#voice-state")).toHaveText("released");
    await expect(page.locator("#voice-frequency")).toHaveText("440");
    await expect(page.locator("#voice-velocity")).toHaveText("0");

    await page.locator("#reset").click();
    await expect(page.locator("#voice-state")).toHaveText("idle");
    await expect(page.locator("#voice-frequency")).toHaveText("none");
    await expect(page.locator("#voice-velocity")).toHaveText("0");
  });
});