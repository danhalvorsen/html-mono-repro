````md
# `@monorepo/core-pdf-reader`

PDF reading and spatial text extraction for the monorepo.

This module is responsible for reading text-based PDF content from a caller-provided binary source and exposing both:

- reconstructed page text
- positioned text fragments
- document metadata
- structured extraction contracts for higher layers

It is built as a reusable application/service module and does not own file system access, UI rendering, or OCR concerns.

---

## Responsibilities

- load a PDF from a caller-provided binary source
- extract raw text fragments with spatial information
- reconstruct page text from positioned fragments
- expose document metadata
- expose structured extraction contracts for higher-level orchestration

---

## Non-responsibilities

- no file system I/O
- no browser rendering
- no canvas rendering
- no OCR
- no AI inference
- no persistence
- no application-specific UI concerns

---

## Installation

This is a private monorepo package.

```json
{
  "dependencies": {
    "@monorepo/core-pdf-reader": "workspace:*"
  }
}
````

---

## Public API

### Primary contracts

| Contract                                 | Description                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `IPdfBinarySource`                       | Abstraction for a PDF binary source.                                                 |
| `IPdfReader`                             | High-level text reader. Reads page text from a binary source.                        |
| `IPdfPageText`                           | Reconstructed text for a single page.                                                |
| `IPdfMetadata`                           | Document metadata abstraction.                                                       |
| `IPdfStructuredExtractionRequest`        | Structured extraction request contract.                                              |
| `IPdfStructuredExtractionResult<TValue>` | Structured extraction result contract.                                               |
| `ICompositePdfEngine`                    | Low-level engine contract for metadata, fragments, pages, and structured extraction. |

### Concrete types

| Type                      | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `CompositePdfEngine`      | Default low-level engine implementation.        |
| `DefaultPdfReader`        | Default high-level reader implementation.       |
| `InMemoryPdfBinarySource` | In-memory implementation of `IPdfBinarySource`. |

---

## Canonical usage

### Read reconstructed text per page

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

const pdfEngine = new CompositePdfEngine();
const pdfReader = new DefaultPdfReader(pdfEngine);

const pages = await pdfReader.read(pdfSource);

for (const page of pages) {
  console.log(`--- Page ${page.pageNumber} ---`);
  console.log(page.text);
}
```

---

### Read raw positioned text fragments

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

const pdfEngine = new CompositePdfEngine();

const fragments = await pdfEngine.readTextFragments(pdfSource);

for (const fragment of fragments) {
  console.log(
    `[p${fragment.pageNumber}] "${fragment.text}" @ (${fragment.x}, ${fragment.y}) ${fragment.width}x${fragment.height}`
  );
}
```

---

### Read document metadata

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

const pdfEngine = new CompositePdfEngine();

const metadata = await pdfEngine.readMetadata(pdfSource);

console.log(metadata.title);
console.log(metadata.author);
console.log(metadata.creationDateUtc);
```

---

### Structured extraction

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

const pdfEngine = new CompositePdfEngine();

const result = await pdfEngine.extractStructured<{ prices: number[] }>(
  pdfSource,
  {
    schemaName: "document-summary",
    prompt: "Return extracted values grouped by the requested schema."
  }
);

console.log(result.schemaName);
console.log(result.value);
```

---

## Architectural model

```text
IPdfBinarySource
      │
      ▼
ICompositePdfEngine
      ├── readMetadata(source)           -> IPdfMetadata
      ├── readPageCount(source)          -> number
      ├── readTextFragments(source)      -> readonly IPdfTextFragment[]
      ├── readPages(source)              -> readonly IPdfPageText[]
      └── extractStructured(source, ...) -> IPdfStructuredExtractionResult<T>

IPdfReader
  └── DefaultPdfReader
          │
          ▼
   ICompositePdfEngine
```

---

## Design notes

### Input boundary

The module uses `IPdfBinarySource` as its input boundary.

This keeps:

* binary acquisition outside the module
* file system concerns outside the module
* browser/network concerns outside the module
* the core PDF logic deterministic and testable

### High-level vs low-level usage

Use `IPdfReader` / `DefaultPdfReader` when you want:

* reconstructed text per page
* a simpler application-facing API

Use `ICompositePdfEngine` / `CompositePdfEngine` when you want:

* metadata
* text fragments with coordinates
* page count
* structured extraction support

### Structured extraction

`extractStructured(...)` is a contract surface only.

This module does not perform AI inference. Any schema interpretation, LLM orchestration, or domain-specific extraction logic belongs in higher layers.

---

## Module structure

```text
src/
  index.ts
  IPdfBinarySource.ts
  IFontInformation.ts
  IFontItem.ts
  IReaderConfiguration.ts
  IPdfImageFragment.ts
  IPdfMetadata.ts
  IPdfPageText.ts
  IPdfReader.ts
  IPdfStructuredExtractionResult.ts
  engine/
    ICompositePdfEngine.ts
    CompositePdfEngine.ts
    PdfImageExtractor.ts
  services/
    DefaultPdfReader.ts
    IPdfStructuredExtractionRequest.ts
  sources/
    InMemoryPdfBinarySource.ts
```

---

## Dependency

| Package      | Role                            |
| ------------ | ------------------------------- |
| `pdfjs-dist` | PDF parsing and text extraction |

---

## Scripts

```bash
pnpm build
pnpm test
pnpm clean
```

---

## Intended consumer guidance

Use this module when your application needs to:

* read text from text-based PDFs
* preserve fragment positioning for spatial analysis
* reconstruct page text
* build higher-level PDF workflows on top of a deterministic core

Do not use this module for:

* scanned-image OCR workflows
* rendering PDFs to a canvas
* UI-specific PDF viewers
* file-system-centric application logic

```
```
