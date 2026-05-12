import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
let baseUrl: string;

test.beforeAll(async () => {
  server = await createServer({
    root: process.cwd(),
    server: {
      host: "127.0.0.1",
      port: 0,
      strictPort: false,
    },
    logLevel: "error",
  });

  await server.listen();

  const address = server.httpServer?.address();

  if (address === undefined || address === null || typeof address === "string") {
    throw new Error("Vite server did not expose a TCP address.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await server.close();
});

test.describe("Voice E2E", () => {
  test("plays a real browser voice from the audio-player element", async ({
    browser,
  }) => {
    const context = await browser.newContext();

    try {
      const page = await context.newPage();
      const errors = collectBrowserErrors(page);

      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await expect
        .poll(async () => {
          return await page.evaluate(() => typeof AudioContext !== "undefined");
        })
        .toBe(true);

      await page.evaluate(() => {
        document.body.innerHTML = "<audio-player></audio-player>";
      });

      const playButton = page.getByRole("button", { name: "Play voice" });

      await expect(playButton).toBeVisible();

      await playButton.click();

      // The production component stops/disposes the voice after 1000 ms.
      await page.waitForTimeout(1200);

      expect(errors()).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

function collectBrowserErrors(page: Page): () => readonly string[] {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  return () => errors;
}