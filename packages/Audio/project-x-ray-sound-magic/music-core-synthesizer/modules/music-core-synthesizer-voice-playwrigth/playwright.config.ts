// playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

const port = 4187;
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests/integration",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: baseUrl,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm exec vite --config tests/browser/vite.config.ts --host ${host} --port ${port}`,
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});