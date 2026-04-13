// packages/core-pdf-reader/src/engine/CompositePdfEngine.ts

import { QuadTreeFactory } from "@monorepo/core-design-pattern-quad-tree";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IPdfMetadata } from "../IPdfMetadata.js";
import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfStructuredExtractionResult } from "../IPdfStructuredExtractionResult.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IPdfStructuredExtractionRequest } from "../services/IPdfStructuredExtractionRequest.js";
import type { ICompositePdfEngine } from "./ICompositePdfEngine.js";

// internal only (no self-import)
interface IPdfJsDocument {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<IPdfJsPage>;
  getMetadata(): Promise<{ info?: Record<string, unknown> }>;
}

interface IPdfJsPage {
  getTextContent(): Promise<{ items: readonly unknown[] }>;
}

interface IPdfJsTextItem {
  readonly str: string;
  readonly transform: readonly number[];
  readonly width?: number;
  readonly height?: number;
}

export class CompositePdfEngine implements ICompositePdfEngine {
  public readonly name = "pdfjs-composite-engine";

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  public async readMetadata(binary: Uint8Array): Promise<IPdfMetadata> {
    const document = await this.loadDocument(binary);
    const metadata = await document.getMetadata();
    const info = metadata.info ?? {};

    return Object.freeze({
      ...(typeof info["Title"] === "string" && { title: info["Title"] }),
      ...(typeof info["Author"] === "string" && { author: info["Author"] }),
      ...(typeof info["Subject"] === "string" && { subject: info["Subject"] }),
      ...(typeof info["Creator"] === "string" && { creator: info["Creator"] }),
      ...(typeof info["Producer"] === "string" && { producer: info["Producer"] }),
      ...(typeof info["CreationDate"] === "string" && { creationDateUtc: info["CreationDate"] }),
      ...(typeof info["ModDate"] === "string" && { modificationDateUtc: info["ModDate"] }),
    });
  }

  public async readPageCount(binary: Uint8Array): Promise<number> {
    const document = await this.loadDocument(binary);
    return document.numPages;
  }

  public async readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]> {
    const fragments = await this.readTextFragments(binary);

    const byPage = new Map<number, IPdfTextFragment[]>();

    for (const f of fragments) {
      const list = byPage.get(f.pageNumber);
      if (list === undefined) byPage.set(f.pageNumber, [f]);
      else list.push(f);
    }

    const pages: IPdfPageText[] = [];

    for (const [pageNumber, pageFragments] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
      const lines = this.groupIntoLines(pageFragments);

      pages.push(
        Object.freeze({
          pageNumber,
          text: lines.join("\n"),
        })
      );
    }

    return Object.freeze(pages);
  }

  public async readTextFragments(binary: Uint8Array): Promise<readonly IPdfTextFragment[]> {
    const document = await this.loadDocument(binary);
    const fragments: IPdfTextFragment[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        if (!this.isTextItem(item)) continue;

        const text = item.str.replace(/\s+/g, " ").trim();
        if (text.length === 0) continue;

        const t = item.transform;

        fragments.push(
          Object.freeze({
            pageNumber,
            text,
            x: Number(t[4] ?? 0),
            y: Number(t[5] ?? 0),
            width: Number(item.width ?? 0),
            height: Number(item.height ?? 0),
          })
        );
      }
    }

    return Object.freeze(fragments);
  }

  public async extractStructured<TValue>(
    binary: Uint8Array,
    request: IPdfStructuredExtractionRequest
  ): Promise<IPdfStructuredExtractionResult<TValue>> {
    const pages = await this.readPages(binary);

    const value = Object.freeze({
      schemaName: request.schemaName,
      pageCount: pages.length,
      fullText: pages.map(p => p.text).join("\n\n"),
    }) as TValue;

    return Object.freeze({
      schemaName: request.schemaName,
      value,
    });
  }

  // ─────────────────────────────────────────────
  // QuadTree grouping (KISS)
  // ─────────────────────────────────────────────

  private groupIntoLines(fragments: readonly IPdfTextFragment[]): readonly string[] {
    const tree = this.buildQuadTree(fragments);
    const visited = new Set<IPdfTextFragment>();
    const result: string[] = [];

    for (const fragment of fragments) {
      if (visited.has(fragment)) continue;

      const toleranceY = fragment.height * 0.5;

      const region = {
        intersects: (b: any) =>
          !(b.y > fragment.y + toleranceY || b.y + b.height < fragment.y - toleranceY),
      };

      const candidates = tree.query(region);

      const line = candidates.filter((c: { y: number; }) => Math.abs(c.y - fragment.y) <= toleranceY);

      for (const item of line) visited.add(item);

      line.sort((a: { x: number; }, b: { x: number; }) => a.x - b.x);

      result.push(line.map((x: { text: any; }) => x.text).join(" "));
    }

    return Object.freeze(result);
  }

  private buildQuadTree(fragments: readonly IPdfTextFragment[]) {
    const factory = new QuadTreeFactory<IPdfTextFragment>();

    const tree = factory.create({
      rootBounds: { x: 0, y: 0, width: 10000, height: 10000 },
      boundsProvider: {
        getBounds: (f: { x: any; y: any; width: any; height: any; }) => ({
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
        }),
      },
      options: {
        maxDepth: 6,
        maxItemsPerNode: 8,
      },
    });

    tree.insertMany(fragments);
    return tree;
  }

  // ─────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────

  private async loadDocument(binary: Uint8Array): Promise<IPdfJsDocument> {
    const task = pdfjs.getDocument({
      data: binary,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
    });

    return (await task.promise) as unknown as IPdfJsDocument;
  }

  private isTextItem(value: unknown): value is IPdfJsTextItem {
    if (typeof value !== "object" || value === null) return false;

    const c = value as Partial<IPdfJsTextItem>;

    return typeof c.str === "string" &&
      Array.isArray(c.transform) &&
      c.transform.length >= 6;
  }
}