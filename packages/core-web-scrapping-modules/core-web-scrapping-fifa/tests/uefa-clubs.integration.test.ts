// packages/core-web-scrapping-fifa/tests/uefa-club-statistics-discovery.integration.test.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { UefaClubStatisticsDiscoveryFactory } from "../src/index.js";

describe("integration: UEFA club statistics discovery", () => {
  it("should discover candidate UEFA statistics data sources from the HTML response", async () => {
    const discovery = await new UefaClubStatisticsDiscoveryFactory()
      .create()
      .discover();

    expect(discovery.statusCode).toBe(200);
    expect(discovery.serviceBaseUrls).toContain("https://compstats.uefa.com/");
    expect(discovery.routeCandidates.length).toBeGreaterThan(0);
    expect(discovery.configurationCandidates.length).toBeGreaterThan(0);

    await writeDiscoveryFile(discovery);
  });
});

async function writeDiscoveryFile(value: unknown): Promise<void> {
  const outputDirectory = path.join(process.cwd(), ".output");
  const outputPath = path.join(outputDirectory, "uefa-club-statistics-discovery.json");

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, JSON.stringify(value, null, 2), "utf8");

  console.log(`Wrote ${outputPath}`);
}