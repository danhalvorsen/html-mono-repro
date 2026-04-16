````md
# Developer-README.md

# `@monorepo/core-pdf-reader` — Developer Guide

This document explains the current developer-facing usage of `@monorepo/core-pdf-reader` as the module exists today.

The package exposes:

- a binary source abstraction
- a high-level PDF reader API
- a lower-level composite engine API
- an in-memory binary source for standard usage

The current canonical developer flow is:

1. acquire PDF bytes outside the module
2. wrap the bytes in an `IPdfBinarySource`
3. choose either:
   - `DefaultPdfReader` for reconstructed page text
   - `CompositePdfEngine` for metadata, page count, fragments, and structured extraction

---

## Architectural intent

The package is designed so that:

- binary acquisition is outside the module
- file system access is outside the module
- browser fetch access is outside the module
- PDF parsing and extraction are inside the module

This keeps the module deterministic and reusable.

---

## Package concepts

| Type | Role |
|---|---|
| `IPdfBinarySource` | Input abstraction for PDF bytes |
| `InMemoryPdfBinarySource` | Standard in-memory implementation of `IPdfBinarySource` |
| `ICompositePdfEngine` | Low-level extraction API |
| `CompositePdfEngine` | Default engine implementation |
| `IPdfReader` | High-level page-text reader API |
| `DefaultPdfReader` | Default high-level reader |
| `IPdfPageText` | Reconstructed text per page |
| `IPdfMetadata` | Metadata projection |
| `IPdfStructuredExtractionRequest` | Structured extraction request contract |
| `IPdfStructuredExtractionResult<T>` | Structured extraction result contract |

---

## 1. Read reconstructed text per page

Use this path when you want a simpler API that gives page text.

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function main(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const pdfEngine = new CompositePdfEngine();
  const pdfReader = new DefaultPdfReader(pdfEngine);

  const pages = await pdfReader.read(pdfSource);

  for (const page of pages) {
    console.log(`--- Page ${page.pageNumber} ---`);
    console.log(page.text);
  }
}

void main();
````

### When to use this path

Use `DefaultPdfReader` when you want:

* page text
* reading-order reconstruction
* a simpler application-facing API

---

## 2. Read raw positioned text fragments

Use this path when you need coordinates for spatial processing.

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function main(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const pdfEngine = new CompositePdfEngine();
  const fragments = await pdfEngine.readTextFragments(pdfSource);

  for (const fragment of fragments) {
    console.log(
      `[p${fragment.pageNumber}] "${fragment.text}" @ (${fragment.x}, ${fragment.y}) ${fragment.width}x${fragment.height}`
    );
  }
}

void main();
```

### When to use this path

Use `CompositePdfEngine.readTextFragments(...)` when you need:

* layout-aware extraction
* bounding boxes
* custom grouping
* clustering
* table-like or region-based analysis

---

## 3. Read document metadata

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function main(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const pdfEngine = new CompositePdfEngine();
  const metadata = await pdfEngine.readMetadata(pdfSource);

  console.log("title:", metadata.title);
  console.log("author:", metadata.author);
  console.log("subject:", metadata.subject);
  console.log("creationDateUtc:", metadata.creationDateUtc);
}

void main();
```

---

## 4. Read page count

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function main(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const pdfEngine = new CompositePdfEngine();
  const pageCount = await pdfEngine.readPageCount(pdfSource);

  console.log("pageCount:", pageCount);
}

void main();
```

---

## 5. Structured extraction contract

This module exposes a structured extraction contract surface. It does not perform AI inference on its own.

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function main(): Promise<void> {
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  const pdfEngine = new CompositePdfEngine();

  const result = await pdfEngine.extractStructured<{ values: string[] }>(
    pdfSource,
    {
      schemaName: "document-summary",
      prompt: "Return extracted values based on the requested schema."
    }
  );

  console.log("schemaName:", result.schemaName);
  console.log("value:", result.value);
}

void main();
```

### Important

`extractStructured(...)` is only a contract boundary in this package.

Higher-level orchestration such as:

* LLM calls
* schema-specific interpretation
* application rules
* validation pipelines

belongs outside this module.

---

## 6. Browser usage

The module can also be used in a browser if the application acquires the PDF bytes first.

```ts
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

async function loadPdfFromUrl(url: string): Promise<void> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  const pdfBytes = new Uint8Array(arrayBuffer);
  const pdfSource = new InMemoryPdfBinarySource(url, pdfBytes);

  const pdfEngine = new CompositePdfEngine();
  const pdfReader = new DefaultPdfReader(pdfEngine);

  const pages = await pdfReader.read(pdfSource);

  for (const page of pages) {
    console.log(`--- Page ${page.pageNumber} ---`);
    console.log(page.text);
  }
}

void loadPdfFromUrl("/assets/sample.pdf");
```

---

## 7. Lit usage example

A Lit component should keep binary acquisition in the component/application layer and use the package for extraction only.

```ts
import { LitElement, html } from "lit";
import { state } from "lit/decorators.js";
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource,
  type IPdfPageText
} from "@monorepo/core-pdf-reader";

export class PdfTextViewerElement extends LitElement {
  @state()
  private pages: readonly IPdfPageText[] = [];

  private readonly pdfEngine = new CompositePdfEngine();
  private readonly pdfReader = new DefaultPdfReader(this.pdfEngine);

  public async load(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    const pdfSource = new InMemoryPdfBinarySource(url, pdfBytes);

    this.pages = await this.pdfReader.read(pdfSource);
  }

  protected override render() {
    return html`
      ${this.pages.map(
        (page) => html`
          <section>
            <h2>Page ${page.pageNumber}</h2>
            <pre>${page.text}</pre>
          </section>
        `
      )}
    `;
  }
}

customElements.define("pdf-text-viewer", PdfTextViewerElement);
```

---

## 8. Current composition model

```text
Caller
  ├── file system / fetch / blob / stream conversion
  └── creates Uint8Array

Uint8Array
  └── InMemoryPdfBinarySource

InMemoryPdfBinarySource
  └── passed to:
        ├── DefaultPdfReader
        │     └── depends on ICompositePdfEngine
        └── CompositePdfEngine
```

---

## 9. Practical guidance

### Use `DefaultPdfReader` when:

* you want page text
* you want a simpler application boundary
* you do not need coordinates

### Use `CompositePdfEngine` when:

* you need metadata
* you need page count
* you need raw text fragments
* you need spatial extraction behavior
* you need structured extraction contracts

---

## 10. What this module does not own

Do not move these concerns into `core-pdf-reader`:

* file system reads
* fetch/network acquisition
* browser viewer rendering
* OCR
* LLM prompting logic
* business-specific extraction rules
* persistence

Those belong in higher layers.

---

## 11. Example import surface

```ts
import {
  CompositePdfEngine,
  DefaultPdfReader,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";
```

---

## 12. Developer notes

The current package surface is infrastructure-exposing rather than facade-first.

That means the current developer workflow is explicit:

* create binary source
* create engine
* optionally create reader
* execute read/extract operation

This is valid for internal monorepo usage, but it is more low-level than an npm-first facade API.

---

## 13. Future API direction

If the package later adds a simpler facade, the likely direction is:

```ts
const reader = createPdfReader();
const result = await reader.readFromBytes(pdfBytes);
```

But that is not the current usage model documented here.

---

## 14. Summary

Current canonical usage is:

```ts
const pdfBytes = new Uint8Array(...);
const pdfSource = new InMemoryPdfBinarySource("document.pdf", pdfBytes);
const pdfEngine = new CompositePdfEngine();
const pdfReader = new DefaultPdfReader(pdfEngine);

const pages = await pdfReader.read(pdfSource);
```

For lower-level extraction:

```ts
const fragments = await pdfEngine.readTextFragments(pdfSource);
const metadata = await pdfEngine.readMetadata(pdfSource);
const pageCount = await pdfEngine.readPageCount(pdfSource);
```

```
```
