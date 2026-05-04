import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CompositePdfEngine,
  InMemoryPdfBinarySource,
  PdfReader,
} from "@monorepo/core-pdf-reader";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const moduleRoot = resolve(testDirectory, "..");
const kiwiPdfPath = resolve(moduleRoot, "../../core-pdf-reader/tests/Kiwi.pdf");

test("sample3 integration should parse Kiwi.pdf with core-pdf-reader", async () => {
  const binary = new Uint8Array(await readFile(kiwiPdfPath));
  const source = new InMemoryPdfBinarySource("Kiwi.pdf", binary);
  const reader = new PdfReader(new CompositePdfEngine());

  const pages = await reader.read(source);

  assert.ok(Array.isArray(pages));
  assert.ok(pages.length > 0, "Expected at least one parsed page from Kiwi.pdf");

  const textLength = pages.reduce((sum, page) => sum + page.text.length, 0);
  assert.ok(textLength > 0, "Expected extracted text from Kiwi.pdf");
});
