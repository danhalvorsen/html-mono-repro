// packages/core-web-scrapping-modules/core-web-scrapping-abstract/tests/use-remeda-external-module/search-html-body.test.ts

import { describe, expect, it } from "vitest";
import { filter, firstBy, map, pipe } from "remeda";

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Welcome to the Price Tracker</h1>

    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: 24 }, (_, index) => {
          const hour = index.toString().padStart(2, "0");
          const price = (100 + index * 5).toFixed(2);

          return `<tr><td>${hour}:00</td><td>${price}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  </body>
</html>`;

interface HtmlTableCandidate {
  readonly table: HTMLTableElement;
  readonly tbody: HTMLTableSectionElement;
  readonly rowCount: number;
  readonly headers: readonly string[];
}

interface PriceRow {
  readonly time: string;
  readonly price: string;
}

describe("search-html-body", () => {
  it("should find a 24-row price table by using Remeda", () => {
    const document = new DOMParser().parseFromString(html, "text/html");

    const candidates = pipe(
      Array.from(document.querySelectorAll("table")),
      map(toTableCandidate),
      filter((candidate): candidate is HtmlTableCandidate => candidate !== undefined),
      filter((candidate) => candidate.rowCount === 24),
      filter((candidate) => candidate.headers.includes("Price"))
    );

    const priceTable = firstBy(candidates, [(candidate) => candidate.rowCount, "desc"]);

    expect(priceTable).toBeDefined();
    expect(priceTable?.rowCount).toBe(24);

    const rows = pipe(
      Array.from(priceTable?.tbody.querySelectorAll("tr") ?? []),
      map(toPriceRow),
      filter((row): row is PriceRow => row !== undefined)
    );

    expect(rows).toHaveLength(24);
    expect(rows[0]).toEqual({
      time: "00:00",
      price: "100.00"
    });
    expect(rows[23]).toEqual({
      time: "23:00",
      price: "215.00"
    });
  });
});

function toTableCandidate(table: HTMLTableElement): HtmlTableCandidate | undefined {
  const tbody = table.querySelector("tbody");

  if (tbody === null) {
    return undefined;
  }

  return {
    table,
    tbody,
    rowCount: tbody.querySelectorAll("tr").length,
    headers: Array.from(table.querySelectorAll("thead th")).map((header) =>
      header.textContent?.trim() ?? ""
    )
  };
}

function toPriceRow(row: HTMLTableRowElement): PriceRow | undefined {
  const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
    cell.textContent?.trim() ?? ""
  );

  const [time, price] = cells;

  if (time === undefined || price === undefined) {
    return undefined;
  }

  return {
    time,
    price
  };
}