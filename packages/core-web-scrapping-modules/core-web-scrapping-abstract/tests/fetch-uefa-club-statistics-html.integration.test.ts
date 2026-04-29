// packages/core-web-scrapping-modules/core-web-scrapping-abstract/tests/fetch-uefa-club-statistics-html.integration.test.ts

import { chromium } from "playwright";
import { describe, expect, it } from "vitest";
import { map, pipe } from "remeda";

const UefaClubStatisticsPageUrl =
  "https://www.uefa.com/uefachampionsleague/statistics/clubs/";

interface UefaRenderedRow {
  readonly rowIndex: number;
  readonly rowId: string | null;
  readonly text: string;
}

describe("integration: UEFA rendered DOM rows", () => {
  it("should find rendered div role=row row-index elements", async () => {
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();

      await page.goto(UefaClubStatisticsPageUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });

      await page
        .getByRole("button", { name: /Reject all|I Accept|Accept all/iu })
        .first()
        .click({ timeout: 5_000 })
        .catch(() => undefined);

      const rowLocator = page.locator('div[role="row"][row-index]');

      await rowLocator.first().waitFor({
        state: "attached",
        timeout: 30_000,
      });

      const rows = pipe(
        await rowLocator.evaluateAll((elements) =>
          elements.map((element) => ({
            rowIndex: Number(element.getAttribute("row-index")),
            rowId: element.getAttribute("row-id"),
            text: element.textContent?.replace(/\s+/gu, " ").trim() ?? "",
          })),
        ),
        map(
          (row): UefaRenderedRow => ({
            rowIndex: row.rowIndex,
            rowId: row.rowId,
            text: row.text,
          }),
        ),
      );

      console.log({
        rowCount: rows.length,
      });

      console.table(
        rows.map((row) => ({
          rowIndex: row.rowIndex,
          rowId: row.rowId,
          text: row.text.slice(0, 300),
        })),
      );

      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.rowIndex).toBe(0);
    } finally {
      await browser.close();
    }
  }, 60_000);
});