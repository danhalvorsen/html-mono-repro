Below is a **developer-grade README** for `core-pdf-dbscan` that is explicitly aligned with `@monorepo/core-pdf-reader` as it exists today (binary source → engine → fragments).

It assumes **DBSCAN operates on `IPdfTextFragment`** coming from `CompositePdfEngine`.

---

````md
# `@monorepo/core-pdf-dbscan`

Spatial clustering for PDF text fragments.

This module builds on `@monorepo/core-pdf-reader` and provides:

- DBSCAN-based clustering of positioned text fragments
- bounding box generation per cluster
- grouping of PDF content into logical regions (lines, blocks, tables, etc.)

---

## Responsibilities

- cluster `IPdfTextFragment` using DBSCAN
- group spatially related text into clusters
- compute cluster bounding boxes
- support deterministic clustering for downstream processing

---

## Non-responsibilities

- no PDF parsing (delegated to `core-pdf-reader`)
- no rendering
- no OCR
- no AI inference
- no domain-specific interpretation (tables, invoices, etc.)

---

## Dependency

```json
{
  "dependencies": {
    "@monorepo/core-pdf-reader": "workspace:*"
  }
}
````

---

## Core concept

```
PDF → core-pdf-reader → IPdfTextFragment[]
                                 │
                                 ▼
                         core-pdf-dbscan
                                 │
                                 ▼
                        clusters + bounding boxes
```

---

## Data model (conceptual)

### Input

```ts
interface IPdfTextFragment {
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Output

```ts
interface Cluster {
  id: string;
  fragments: readonly IPdfTextFragment[];
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}
```

---

## 1. End-to-end usage (recommended)

```ts
import { readFileSync } from "node:fs";
import {
  CompositePdfEngine,
  InMemoryPdfBinarySource
} from "@monorepo/core-pdf-reader";

import {
  DbscanClusterer
} from "@monorepo/core-pdf-dbscan";

async function main(): Promise<void> {
  // 1. Load PDF
  const pdfBytes = new Uint8Array(readFileSync("document.pdf"));
  const source = new InMemoryPdfBinarySource("document.pdf", pdfBytes);

  // 2. Extract fragments
  const engine = new CompositePdfEngine();
  const fragments = await engine.readTextFragments(source);

  // 3. Cluster fragments
  const clusterer = new DbscanClusterer({
    eps: 4,
    minPts: 2
  });

  const clusters = clusterer.cluster(fragments);

  // 4. Inspect clusters
  for (const cluster of clusters) {
    console.log("Cluster:", cluster.id);
    console.log("Bounding box:", cluster.boundingBox);

    for (const f of cluster.fragments) {
      console.log(" ", f.text);
    }
  }
}

void main();
```

---

## 2. Parameters

### `eps` (epsilon)

Maximum distance between two fragments to be considered neighbors.

* small → tighter clusters
* large → merged clusters

Typical range for PDF coordinates:

```
eps: 2 – 10
```

---

### `minPts`

Minimum number of points to form a cluster.

* low → more clusters, more noise sensitivity
* high → fewer clusters, more strict grouping

Typical:

```
minPts: 2 – 5
```

---

## 3. Distance model

Clustering operates on spatial proximity.

Typical implementation:

```text
distance = euclidean(center(fragmentA), center(fragmentB))
```

Alternative strategies (future extension):

* vertical-only distance (line grouping)
* Manhattan distance
* weighted axis distance (x vs y bias)

---

## 4. Cluster bounding box

Each cluster computes a bounding box:

```text
minX = min(fragment.x)
minY = min(fragment.y)
maxX = max(fragment.x + fragment.width)
maxY = max(fragment.y + fragment.height)
```

Used for:

* region extraction
* layout analysis
* visualization overlays

---

## 5. Noise handling

DBSCAN produces:

* clusters
* noise points (unclustered fragments)

Depending on implementation, noise may be:

* excluded
* returned separately
* included as single-point clusters

Define behavior explicitly in your implementation.

---

## 6. Typical use cases

### Line reconstruction (alternative to reader)

* cluster horizontally aligned fragments
* sort by x
* join text

---

### Block detection

* cluster paragraphs
* group invoice sections
* detect headers/footers

---

### Table detection (primitive)

* cluster by rows (small `eps.y`)
* cluster by columns (small `eps.x`)

---

### Layout segmentation

* detect regions of interest
* isolate product cards
* isolate pricing blocks

---

## 7. Integration pattern

```
core-pdf-reader
   └── extracts fragments

core-pdf-dbscan
   └── groups fragments

application layer
   └── interprets clusters
```

This separation is intentional:

* reader = extraction
* dbscan = grouping
* app = meaning

---

## 8. Determinism

Clustering must be:

* deterministic
* stable for identical inputs
* independent of iteration order

Ensure:

* consistent distance calculation
* deterministic iteration
* stable cluster IDs (optional but recommended)

---

## 9. Example: cluster → text blocks

```ts
const blocks = clusters.map(cluster => {
  const sorted = [...cluster.fragments]
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const text = sorted.map(f => f.text).join(" ");

  return {
    id: cluster.id,
    text,
    boundingBox: cluster.boundingBox
  };
});
```

---

## 10. Module structure (expected)

```
src/
  DbscanClusterer.ts
  IDbscanOptions.ts
  ICluster.ts
  BoundingBox.ts
  distance/
    EuclideanDistance.ts
  index.ts
```

---

## 11. Summary

`core-pdf-dbscan` is a **pure spatial grouping module**.

It depends on:

* `core-pdf-reader` → extraction

It provides:

* clustering
* bounding boxes
* grouping primitives

It does not:

* interpret meaning
* perform OCR
* render output

---

## Canonical flow

```ts
PDF → fragments → clusters → application logic
```

```

---

If you want next step, I can:

- align this README exactly to your **actual code signatures**
- or refactor your DBSCAN module into **strategy-based clustering (open/closed)** (distance strategy, cluster policy, bounding box strategy)
```
