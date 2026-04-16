# `@monorepo/core-pdf-reader`

PDF reading and spatial text extraction for the monorepo.  
Built on [`pdfjs-dist`](https://mozilla.github.io/pdf.js/).

---

## Responsibilities

- Load a PDF from a binary source (`Uint8Array`)
- Extract raw text fragments with **spatial coordinates** (x, y, width, height)
- Reconstruct per-page text in reading order
- Provide structured extraction via a named schema request

## Non-responsibilities

- No rendering or canvas output
- No OCR — text must already be encoded in the PDF
- No AI inference — `extractStructured` is a pass-through contract for higher layers
- No file system I/O — callers supply a `IPdfBinarySource`

---

## Installation

This is a private monorepo package. Add it as a workspace dependency:

```json
"dependencies": {
  "@monorepo/core-pdf-reader": "workspace:*"
}
```

---

## Public API

### Contracts

| Interface | Description |
|---|---|
| `IPdfBinarySource` | Source of a raw PDF `Uint8Array`. Has a `name` and a `read()` method. |
| `IPdfReader` | High-level reader. `read(source)` → `readonly IPdfPageText[]` |
| `IPdfPageText` | Page number + reconstructed plain text for that page |
| `IPdfTextFragment` | Single positioned text span: `pageNumber`, `text`, `x`, `y`, `width`, `height` |
| `IPdfMetadata` | Optional document properties: `title`, `author`, `subject`, `creator`, `producer`, `creationDateUtc`, `modificationDateUtc` |
| `ICompositePdfEngine` | Low-level engine. Provides metadata, page count, pages, fragments, and structured extraction. |
| `IPdfStructuredExtractionRequest` | Named schema + optional prompt for structured extraction. |
| `IPdfStructuredExtractionResult<TValue>` | Schema name + typed extracted value. |

### Concrete classes

| Class | Description |
|---|---|
| `CompositePdfEngine` | `pdfjs-dist`-backed implementation of `ICompositePdfEngine`. |
| `DefaultPdfReader` | Wraps `ICompositePdfEngine` to implement `IPdfReader`. |
| `InMemoryPdfBinarySource` | `IPdfBinarySource` backed by an in-memory `Uint8Array`. |

---

## Usage

### Read plain text per page

```ts
import { readFileSync } from 'node:fs';
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource,
} from '@monorepo/core-pdf-reader';

const binary = readFileSync('document.pdf');
const source = new InMemoryPdfBinarySource('document.pdf', new Uint8Array(binary));

const engine = new CompositePdfEngine();
const reader = new DefaultPdfReader(engine);

const pages = await reader.read(source);

for (const page of pages) {
  console.log(`--- Page ${page.pageNumber} ---`);
  console.log(page.text);
}
```

### Read raw spatial fragments

```ts
const binary = new Uint8Array(readFileSync('document.pdf'));
const engine = new CompositePdfEngine();

const fragments = await engine.readTextFragments(binary);

for (const f of fragments) {
  console.log(`[p${f.pageNumber}] "${f.text}" @ (${f.x}, ${f.y}) ${f.width}×${f.height}`);
}
```

### Read document metadata

```ts
const metadata = await engine.readMetadata(binary);
console.log(metadata.title, metadata.author, metadata.creationDateUtc);
```

### Structured extraction

```ts
const result = await engine.extractStructured<{ prices: number[] }>(binary, {
  schemaName: 'document-summary',
  prompt: 'Return the document text grouped by page.',
});

console.log(result.schemaName); // 'document-summary'
console.log(result.value);      // { prices: [...] }
```

---

## Architecture

```
IPdfBinarySource
      │
      ▼
ICompositePdfEngine  ◄──────────────────────────────────────────┐
      │                                                          │
      ├── readMetadata()      → IPdfMetadata                    │
      ├── readPageCount()     → number                          │
      ├── readPages()         → IPdfPageText[]                  │   CompositePdfEngine
      ├── readTextFragments() → IPdfTextFragment[]              │   (pdfjs-dist)
      └── extractStructured() → IPdfStructuredExtractionResult  │
                                                                 │
IPdfReader                                                       │
  └── DefaultPdfReader ──► ICompositePdfEngine ─────────────────┘
```

### Line reconstruction

    `readPages()` calls `readTextFragments()` internally, sorts fragments by reading order, and joins them into `IPdfPageText.text`.

---

## Module structure

```
src/
  index.ts                          ← public surface
  IPdfBinarySource.ts
  IPdfMetadata.ts
  IPdfPageText.ts
  IPdfReader.ts
  IPdfStructuredExtractionResult.ts
  IPdfTextFragment.ts
  engine/
    ICompositePdfEngine.ts
    CompositePdfEngine.ts           ← pdfjs-dist adapter
  services/
    IPdfStructuredExtractionRequest.ts
    DefaultPdfReader.ts
  sources/
    InMemoryPdfBinarySource.ts
tests/
  reader.test.ts
  engine.integration.test.ts
  engine.textdump.integration.test.ts
  Kiwi.pdf                          ← fixture PDF
```

---

## Dependencies

| Package | Role |
|---|---|
| `pdfjs-dist` | PDF parsing and text extraction |

---

## Scripts

```bash
pnpm build      # tsc compile → dist/
pnpm test       # vitest run
pnpm clean      # rimraf dist
```
