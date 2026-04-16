// packages/core-pdf-reader/src/engine/CompositePdfEngine.ts

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IPdfMetadata } from "../IPdfMetadata.js";
import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfStructuredExtractionResult } from "../IPdfStructuredExtractionResult.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IFontInformation } from "../IFontInformation.js";
import type { IPdfStructuredExtractionRequest } from "../services/IPdfStructuredExtractionRequest.js";
import type { ICompositePdfEngine } from "./ICompositePdfEngine.js";

// internal only (no self-import)
interface IPdfJsDocument {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<IPdfJsPage>;
  getMetadata(): Promise<{ info?: Record<string, unknown> }>;
}

interface IPdfJsPage {
  getTextContent(): Promise<IPdfJsTextContent>;
}

interface IPdfJsTextStyle {
  readonly fontFamily?: string;
}

interface IPdfJsTextContent {
  readonly items: readonly unknown[];
  readonly styles?: Readonly<Record<string, IPdfJsTextStyle>>;
}

interface IPdfJsTextItem {
  readonly str: string;
  readonly fontInformation?: IFontInformation;
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
      pages.push(
        Object.freeze({
          pageNumber,
          text: this.toPageText(pageFragments),
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
        const rawFontName = this.resolveRawFontName(item);
        const fontSize = this.resolveFontSize(t);
        const fontFamily = this.resolveFontFamily(rawFontName, textContent.styles);
        const font = this.createFontItem(rawFontName, fontFamily, fontSize);

        fragments.push(
          Object.freeze({
            pageNumber,
            text,
            x: Number(t[4] ?? 0),
            y: Number(t[5] ?? 0),
            width: Number(item.width ?? 0),
            height: Number(item.height ?? 0),
            ...(font !== undefined && { font }),
            ...(typeof rawFontName === "string" && { fontName: rawFontName }),
            ...(fontFamily !== undefined && { fontFamily }),
            ...(fontSize > 0 && { fontSize }),
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
  // Internal helpers
  // ─────────────────────────────────────────────

  private toPageText(fragments: readonly IPdfTextFragment[]): string {
    return fragments
      .slice()
      .sort((left, right) => {
        const deltaY = right.y - left.y;
        if (Math.abs(deltaY) > 2) {
          return deltaY;
        }

        return left.x - right.x;
      })
      .map((fragment) => fragment.text)
      .join(" ");
  }

  private resolveFontSize(transform: readonly number[]): number {
    const verticalScale = Math.hypot(
      Number(transform[2] ?? 0),
      Number(transform[3] ?? 0),
    );

    if (verticalScale > 0) {
      return verticalScale;
    }

    return Math.hypot(
      Number(transform[0] ?? 0),
      Number(transform[1] ?? 0),
    );
  }

  private resolveFontFamily(
    fontName: string | undefined,
    styles: IPdfJsTextContent["styles"],
  ): string | undefined {
    if (fontName === undefined || styles === undefined) {
      return undefined;
    }

    const style = styles[fontName];
    return typeof style?.fontFamily === "string" ? style.fontFamily : undefined;
  }

  private resolveRawFontName(item: IPdfJsTextItem): string | undefined {
    const candidate = (item as { fontInformation?: unknown; fontName?: unknown }).fontInformation
      ?? (item as { fontName?: unknown }).fontName;

    if (typeof candidate === "string") {
      return candidate;
    }

    if (typeof candidate === "object" && candidate !== null) {
      const withRaw = candidate as Partial<IFontInformation>;

      if (typeof withRaw.rawName === "string") {
        return withRaw.rawName;
      }

      if (typeof withRaw.name === "string") {
        return withRaw.name;
      }
    }

    return undefined;
  }

  private createFontItem(
    fontName: string | undefined,
    fontFamily: string | undefined,
    fontSize: number,
  ): IFontInformation | undefined {
    const resolvedName = fontFamily ?? fontName;
    if (resolvedName === undefined && fontSize <= 0) {
      return undefined;
    }

    return {
      name: resolvedName ?? "unknown",
      size: Math.max(fontSize, 0),
      ...(fontFamily !== undefined && { family: fontFamily }),
      ...(fontName !== undefined && { rawName: fontName }),
    };
  }

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