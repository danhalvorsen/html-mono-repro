# fix.lyse-rendered-table-ollama-rows-only.ps1
# Run from:
# C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-http-request-message-ollama\core-http-messages-ollama-integration-tests
#
# Fix:
# - Still fetches Lyse.
# - Still renders the Lyse page and extracts the real rendered table.
# - Sends a compact HTML table to Ollama.
# - Ollama only extracts rows.
# - Test code owns constants like sourceUrl/unit.
# - Asserts exactly 24 rows.

$ErrorActionPreference = "Stop"

$ModulePath = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-http-request-message-ollama\core-http-messages-ollama-integration-tests"

function Write-ModuleFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    $Path = Join-Path $ModulePath $RelativePath
    $Directory = Split-Path $Path -Parent

    if (-not (Test-Path $Directory)) {
        New-Item -ItemType Directory -Path $Directory -Force | Out-Null
    }

    if (Test-Path $Path) {
        Copy-Item -Path $Path -Destination "$Path.bak" -Force
    }

    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "Wrote $Path"
}

Write-ModuleFile -RelativePath "tests\lyse-strompriser-to-ollama.integration.test.ts" -Content @'
import { describe, expect, it } from "vitest";
import { chromium, type Page } from "playwright";

import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
  type IHttpResponseMessage
} from "@monorepo/core-http-messages";

import { HttpClientBuilder } from "@monorepo/core-http-messages-http-client";

import {
  OllamaEndpoint,
  OllamaGenerateRequestMessageFactory,
  OllamaResponseContentReader,
  type OllamaGenerateRequest
} from "@monorepo/core-http-messages-ollama";

const LyseStrompriserUrl = "https://www.lyse.no/strom/strompriser";

interface LysePriceTable {
  readonly sourceUrl: string;
  readonly unit: string;
  readonly rows: readonly LysePriceRow[];
}

interface LysePriceRow {
  readonly hour: string;
  readonly price: string;
  readonly level: string;
}

describe("integration: Lyse rendered price table HTML to Ollama", () => {
  it("should fetch Lyse, send rendered HTML table to Ollama, and assert 24 extracted rows", async () => {
    const rawResponse = await fetchRawLyseResponse();

    expect(rawResponse.statusCode).toBe(200);
    expect(typeof rawResponse.body).toBe("string");

    const rawHtml = readStringBody(rawResponse);

    expect(rawHtml.length).toBeGreaterThan(1_000);

    const renderedTableHtml = await readRenderedLysePriceTableHtml();
    const deterministicRows = extractRowsFromTableHtml(renderedTableHtml);
    const compactTableHtml = createCompactHtmlTable(deterministicRows);

    console.log({
      rawHtmlLength: rawHtml.length,
      renderedTableHtmlLength: renderedTableHtml.length,
      compactTableHtmlLength: compactTableHtml.length,
      deterministicRowCount: deterministicRows.length,
      compactTablePreview: compactTableHtml.slice(0, 700)
    });

    expect(deterministicRows).toHaveLength(24);

    const ollamaResponse = await sendTableHtmlToOllama(compactTableHtml);

    if (ollamaResponse.statusCode !== 200) {
      throw new Error(
        [
          `Expected Ollama HTTP 200. Actual: ${ollamaResponse.statusCode}.`,
          "Ollama response body:",
          stringifyBody(ollamaResponse.body)
        ].join("\n")
      );
    }

    expect(ollamaResponse.statusCode).toBe(200);
    expect(ollamaResponse.isJson()).toBe(true);

    const generatedText = new OllamaResponseContentReader()
      .readGenerateText(ollamaResponse);

    console.log({
      model: getOllamaModelName(),
      generatedText
    });

    const generatedRows = parseGeneratedRows(generatedText);

    const generatedTable: LysePriceTable = {
      sourceUrl: LyseStrompriserUrl,
      unit: "øre",
      rows: generatedRows
    };

    expect(generatedTable.sourceUrl).toBe(LyseStrompriserUrl);
    expect(generatedTable.unit).toBe("øre");
    expect(generatedTable.rows).toHaveLength(24);

    expect(generatedTable.rows.map((row) => normalizeHour(row.hour))).toEqual(
      deterministicRows.map((row) => normalizeHour(row.hour))
    );

    for (let index = 0; index < generatedTable.rows.length; index += 1) {
      const generated = generatedTable.rows[index]!;
      const expected = deterministicRows[index]!;

      expect(normalizeHour(generated.hour)).toBe(normalizeHour(expected.hour));
      expect(normalizePrice(generated.price)).toBe(normalizePrice(expected.price));
      expect(normalizeLevel(generated.level)).toBe(normalizeLevel(expected.level));
    }
  });
});

async function fetchRawLyseResponse(): Promise<IHttpResponseMessage> {
  const client = new HttpClientBuilder().build();

  return client.send(
    new HttpRequestMessageBuilder()
      .withMethod("GET")
      .withPath(LyseStrompriserUrl)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.Accept, "text/html,application/xhtml+xml,text/plain")
          .build()
      )
      .build()
  );
}

async function readRenderedLysePriceTableHtml(): Promise<string> {
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    });

    await page.goto(LyseStrompriserUrl, {
      waitUntil: "domcontentloaded"
    });

    await waitForPriceRows(page);

    const tableHtml = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll("table"));

      const table = tables.find((candidate) => {
        const text = candidate.textContent ?? "";

        return (
          text.includes("kl 00-01") &&
          text.includes("kl 23-00") &&
          text.includes("øre")
        );
      });

      return table?.outerHTML;
    });

    if (tableHtml === undefined) {
      const bodyText = await page.locator("body").innerText();

      throw new Error(
        [
          "Could not find rendered Lyse price table.",
          "Body preview:",
          bodyText.slice(0, 2_000)
        ].join("\n")
      );
    }

    return tableHtml;
  } finally {
    await browser.close();
  }
}

async function waitForPriceRows(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const bodyText = document.body.textContent ?? "";

      return (
        bodyText.includes("kl 00-01") &&
        bodyText.includes("kl 23-00") &&
        bodyText.includes("øre")
      );
    },
    undefined,
    {
      timeout: 30_000
    }
  );
}

async function sendTableHtmlToOllama(
  tableHtml: string
): Promise<IHttpResponseMessage> {
  const client = new HttpClientBuilder().build();

  const endpoint = OllamaEndpoint.create({
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"
  });

  const requestBody: OllamaGenerateRequest = {
    model: getOllamaModelName(),
    stream: false,
    prompt: createPrompt(tableHtml),
    format: "json",
    options: {
      temperature: 0,
      num_ctx: 2048,
      num_predict: 1400
    }
  };

  const request = new OllamaGenerateRequestMessageFactory(endpoint)
    .create(requestBody);

  return client.send(request);
}

function createPrompt(tableHtml: string): string {
  return [
    "You are a strict HTML table to JSON converter.",
    "Return exactly one JSON object.",
    "Do not include markdown.",
    "Do not include explanation.",
    "",
    "Output shape:",
    "{",
    '  "rows": [',
    '    { "hour": "kl 00-01", "price": "130,94 øre", "level": "Øvre" }',
    "  ]",
    "}",
    "",
    "Rules:",
    "- Extract every table row from the HTML table body.",
    "- Return exactly 24 rows.",
    "- Copy hour exactly from column 1.",
    "- Copy price exactly from column 2.",
    "- Copy level exactly from column 3.",
    "- Do not invent values.",
    "",
    "HTML table:",
    tableHtml
  ].join("\n");
}

function createCompactHtmlTable(rows: readonly LysePriceRow[]): string {
  const body = rows
    .map((row) =>
      [
        "<tr>",
        `<td>${escapeHtml(row.hour)}</td>`,
        `<td>${escapeHtml(row.price)}</td>`,
        `<td>${escapeHtml(row.level)}</td>`,
        "</tr>"
      ].join("")
    )
    .join("");

  return [
    "<table>",
    "<thead>",
    "<tr><th>Klokkeslett</th><th>Pris per kWh</th><th>Prisinndeling</th></tr>",
    "</thead>",
    "<tbody>",
    body,
    "</tbody>",
    "</table>"
  ].join("");
}

function extractRowsFromTableHtml(tableHtml: string): readonly LysePriceRow[] {
  return [...tableHtml.matchAll(/<tr\b[\s\S]*?<\/tr>/giu)]
    .map((match) => match[0])
    .map(extractRowFromTrHtml)
    .filter((row): row is LysePriceRow => row !== undefined);
}

function extractRowFromTrHtml(trHtml: string): LysePriceRow | undefined {
  const cells = [...trHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/giu)]
    .map((match) => htmlToText(match[1] ?? ""));

  if (cells.length < 2) {
    return undefined;
  }

  const hour = normalizeHour(cells[0] ?? "");

  if (!/^kl \d{2}-\d{2}$/u.test(hour)) {
    return undefined;
  }

  const price = extractPriceText(cells[1] ?? "");
  const levelSource = cells.length >= 3
    ? cells[2] ?? ""
    : cells[1] ?? "";

  return {
    hour,
    price,
    level: extractLevelText(levelSource)
  };
}

function parseGeneratedRows(text: string): readonly LysePriceRow[] {
  const parsed = parseJsonObject(text);
  const rows = parsed.rows;

  if (!Array.isArray(rows)) {
    throw new Error(
      [
        "Expected Ollama JSON object to contain array property 'rows'.",
        "Generated text:",
        text
      ].join("\n")
    );
  }

  return rows.map(parseLysePriceRow);
}

function parseLysePriceRow(value: unknown): LysePriceRow {
  const row = requireRecord(value);

  if (typeof row.hour !== "string") {
    throw new Error("Expected row.hour to be string.");
  }

  if (typeof row.price !== "string") {
    throw new Error("Expected row.price to be string.");
  }

  if (typeof row.level !== "string") {
    throw new Error("Expected row.level to be string.");
  }

  return {
    hour: row.hour,
    price: row.price,
    level: row.level
  };
}

function extractPriceText(text: string): string {
  const match = text.match(/\d+(?:[,.]\d+)?\s*øre/iu);
  return match?.[0]?.trim() ?? "UNKNOWN";
}

function extractLevelText(text: string): string {
  const match = text.match(/\b(?:Nedre|Midtre|Øvre|Ovre)\b/iu);
  return normalizeLevel(match?.[0] ?? "UNKNOWN");
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeHour(value: string): string {
  const match = value.trim().match(/(?:kl\s*)?(\d{1,2})\s*[-–]\s*(\d{1,2})/iu);

  if (match === null) {
    return value.trim();
  }

  const start = match[1]!.padStart(2, "0");
  const end = match[2]!.padStart(2, "0");

  return `kl ${start}-${end}`;
}

function normalizePrice(value: string): string {
  const match = value.trim().match(/(\d+(?:[,.]\d+)?)\s*øre/iu);

  if (match === null) {
    return value.trim();
  }

  return `${match[1]!.replace(".", ",")} øre`;
}

function normalizeLevel(value: string): string {
  return value
    .replace(/Ovre/giu, "Øvre")
    .trim();
}

function getOllamaModelName(): string {
  const modelName = process.env.OLLAMA_TEST_MODEL;

  if (modelName !== undefined && modelName.trim().length > 0) {
    return modelName;
  }

  return "qwen2.5-coder:7b";
}

function readStringBody(response: IHttpResponseMessage): string {
  if (typeof response.body !== "string") {
    throw new Error("Expected Lyse HTTP response body to be a string.");
  }

  return response.body;
}

function parseJsonObject(text: string): Record<string, unknown> {
  try {
    return requireRecord(JSON.parse(text));
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/iu);

    if (fenced?.[1] !== undefined) {
      return requireRecord(JSON.parse(fenced[1]));
    }

    const objectMatch = text.match(/\{[\s\S]*\}/u);

    if (objectMatch === null) {
      throw new Error(`Ollama did not return JSON object. Text: ${text}`);
    }

    return requireRecord(JSON.parse(objectMatch[0]));
  }
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected JSON object.");
  }

  return value as Record<string, unknown>;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, "\"")
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

function stringifyBody(body: unknown): string {
  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body, null, 2);
}
'@

Write-Host ""
Write-Host "Patched Lyse integration test."
Write-Host ""
Write-Host "Run:"
Write-Host '  $env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"'
Write-Host '  $env:OLLAMA_TEST_MODEL = "qwen2.5-coder:7b"'
Write-Host "  pnpm --workspace-root vitest --config packages/core-http-request-message-ollama/core-http-messages-ollama-integration-tests/vitest.config.ts run tests/lyse-strompriser-to-ollama.integration.test.ts"