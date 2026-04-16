import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IFontInformation } from "../IFontInformation.js";
import type { IPdfPage } from "./IPdfPage.js";
import type {
  IPdfJsPageProxy,
  IPdfJsTextContent,
  IPdfJsTextStyle,
  IPdfJsViewport,
} from "./PdfJsDocumentFactory.js";

interface IPdfJsTextItem {
  readonly str: string;
  readonly fontInformation?: IFontInformation;
  readonly transform: readonly number[];
  readonly width?: number;
  readonly height?: number;
}

export class PdfJsPage implements IPdfPage {
  public constructor(
    private readonly inner: IPdfJsPageProxy,
  ) {}

  public get pageNumber(): number {
    return this.inner.pageNumber;
  }

  public async readTextFragments(): Promise<readonly IPdfTextFragment[]> {
    const content = await this.inner.getTextContent();
    const viewport = this.inner.getViewport({ scale: 1 });

    const fragments: IPdfTextFragment[] = [];

    for (const item of content.items) {
      if (!this.isTextItem(item)) {
        continue;
      }

      const text = this.normalizeText(item.str);
      if (text.length === 0) {
        continue;
      }

      fragments.push(
        Object.freeze(this.createFragment(this.pageNumber, item, content, viewport)),
      );
    }

    return Object.freeze(fragments);
  }

  public async readText(): Promise<IPdfPageText> {
    const fragments = await this.readTextFragments();

    const text = fragments
      .slice()
      .sort((a, b) => {
        const dy = b.y - a.y;
        if (Math.abs(dy) > 2) {
          return dy;
        }

        return a.x - b.x;
      })
      .map((fragment) => fragment.text)
      .join(" ");

    return Object.freeze({
      pageNumber: this.pageNumber,
      text,
    });
  }

  private createFragment(
    pageNumber: number,
    item: IPdfJsTextItem,
    content: IPdfJsTextContent,
    viewport: IPdfJsViewport,
  ): IPdfTextFragment {
    const transform = this.transform(viewport.transform, item.transform);
    const rawFontName = this.resolveRawFontName(item);
    const fontSize = this.resolveFontSize(transform);
    const fontFamily = this.resolveFontFamily(rawFontName, content.styles);
    const font = this.createFontItem(rawFontName, fontFamily, fontSize);

    return {
      pageNumber,
      text: this.normalizeText(item.str),
      x: this.toNumber(transform[4]),
      y: this.toNumber(transform[5]),
      width: this.toNumber(item.width) * viewport.scale,
      height: this.resolveHeight(item, transform),
      ...(font !== undefined && { font }),
      ...(typeof rawFontName === "string" && { fontName: rawFontName }),
      ...(fontFamily !== undefined && { fontFamily }),
      ...(fontSize > 0 && { fontSize }),
    };
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

  private resolveHeight(
    item: IPdfJsTextItem,
    transform: readonly number[],
  ): number {
    const explicitHeight = this.toNumber(item.height);
    if (explicitHeight > 0) {
      return explicitHeight;
    }

    return Math.hypot(
      this.toNumber(transform[2]),
      this.toNumber(transform[3]),
    );
  }

  private resolveFontSize(transform: readonly number[]): number {
    const verticalScale = Math.hypot(
      this.toNumber(transform[2]),
      this.toNumber(transform[3]),
    );

    if (verticalScale > 0) {
      return verticalScale;
    }

    return Math.hypot(
      this.toNumber(transform[0]),
      this.toNumber(transform[1]),
    );
  }

  private resolveFontFamily(
    fontName: string | undefined,
    styles: IPdfJsTextContent["styles"],
  ): string | undefined {
    if (fontName === undefined || styles === undefined) {
      return undefined;
    }

    const style: IPdfJsTextStyle | undefined = styles[fontName];
    return typeof style?.fontFamily === "string" ? style.fontFamily : undefined;
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }

  private toNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }

  private isTextItem(value: unknown): value is IPdfJsTextItem {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Partial<IPdfJsTextItem>;

    return (
      typeof candidate.str === "string" &&
      Array.isArray(candidate.transform) &&
      candidate.transform.length >= 6
    );
  }

  private transform(
    left: readonly number[],
    right: readonly number[],
  ): readonly number[] {
    const a0 = this.toNumber(left[0]);
    const a1 = this.toNumber(left[1]);
    const a2 = this.toNumber(left[2]);
    const a3 = this.toNumber(left[3]);
    const a4 = this.toNumber(left[4]);
    const a5 = this.toNumber(left[5]);

    const b0 = this.toNumber(right[0]);
    const b1 = this.toNumber(right[1]);
    const b2 = this.toNumber(right[2]);
    const b3 = this.toNumber(right[3]);
    const b4 = this.toNumber(right[4]);
    const b5 = this.toNumber(right[5]);

    return Object.freeze([
      a0 * b0 + a2 * b1,
      a1 * b0 + a3 * b1,
      a0 * b2 + a2 * b3,
      a1 * b2 + a3 * b3,
      a0 * b4 + a2 * b5 + a4,
      a1 * b4 + a3 * b5 + a5,
    ]);
  }
}