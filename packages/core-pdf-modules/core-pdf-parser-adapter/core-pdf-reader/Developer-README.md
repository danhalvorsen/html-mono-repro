# `@monorepo/core-pdf-reader` Developer Guide

This guide reflects the current package behavior in this repo.

## Current API Surface

Primary exports:

- `CompositePdfEngine` (low-level extraction API)
- `PdfReader` (high-level page-text reader)
- `InMemoryPdfBinarySource` (binary source implementation)
- contracts like `IPdfReader`, `IPdfTextFragment`, `IPdfMetadata`, `IPdfPageText`

Key method signatures:

- `PdfReader.read(source: IPdfBinarySource): Promise<readonly IPdfPageText[]>`
- `CompositePdfEngine.readPageCount(binary: Uint8Array): Promise<number>`
- `CompositePdfEngine.readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]>`
- `CompositePdfEngine.readTextFragments(binary: Uint8Array): Promise<readonly IPdfTextFragment[]>`
- `CompositePdfEngine.readMetadata(binary: Uint8Array): Promise<IPdfMetadata>`

## Important Usage Rule

`PdfReader` accepts an `IPdfBinarySource`.
`CompositePdfEngine` accepts `Uint8Array`.

Do not pass `InMemoryPdfBinarySource` directly into `CompositePdfEngine` methods.

## High-Level Flow (Page Text)

Use this when you want reconstructed text per page.

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  PdfReader,
  InMemoryPdfBinarySource,
} from "@monorepo/core-pdf-reader";

async function run(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const source = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const engine = new CompositePdfEngine();
  const reader = new PdfReader(engine);
  const pages = await reader.read(source);

  for (const page of pages) {
    console.log(`Page ${page.pageNumber}`);
    console.log(page.text);
  }
}

void run();
```

## Low-Level Flow (Fragments / Metadata / Count)

Use this when you need coordinates or full extraction control.

```ts
import { readFileSync } from "node:fs";
import { CompositePdfEngine } from "@monorepo/core-pdf-reader";

async function run(): Promise<void> {
  const binary = new Uint8Array(readFileSync("document.pdf"));
  const engine = new CompositePdfEngine();

  const pageCount = await engine.readPageCount(binary);
  const metadata = await engine.readMetadata(binary);
  const fragments = await engine.readTextFragments(binary);

  console.log({ pageCount, metadata, fragmentCount: fragments.length });
}

void run();
```

Access fragment geometry using `fragment.boundingBox`:

```ts
const { x, y } = fragment.boundingBox.position;
const { width, height } = fragment.boundingBox;
```

## Structured Extraction Contract

`extractStructured(...)` is a contract boundary, not an AI implementation.

```ts
const result = await engine.extractStructured<{ fullText: string }>(binary, {
  schemaName: "document-summary",
  prompt: "Optional instruction for caller orchestration",
});
```

## Integration-Test Notes

Relevant tests:

- `tests/PID/*.integration.test.ts`
- `tests/Selfmade/save-1776869954888.integration.test.ts`

`tests/Selfmade/save-1776869954888.pdf` is geometry-only from the text engine perspective:

- `readPageCount(...)` returns `1`
- `readTextFragments(...)` returns `0`
- `readPages(...)` returns `0`

This is expected with current `CompositePdfEngine` behavior (text-item extraction).

## What This Package Owns

- PDF text extraction (`pdfjs-dist`)
- metadata mapping
- text fragment coordinate extraction
- page-text reconstruction from extracted text fragments

## What This Package Does Not Own

- file system orchestration in calling app layers
- network fetching orchestration
- OCR
- business/domain-specific interpretation rules
- persistence

## Commands

From repo root:

```bash
pnpm --filter @monorepo/core-pdf-reader build
pnpm --filter @monorepo/core-pdf-reader test
```
