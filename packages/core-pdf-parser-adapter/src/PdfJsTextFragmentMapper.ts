import { TextFragment, Rectangle, Point } from "@monorepo/core-pdf-domain";
import { PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport, PdfJsNativeTextStyle } from "./code.js";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { ITextFragmentMapper } from "./ITextFragmentMapper.js";
import type { IPdfFragment } from "@monorepo/core-pdf-domain"

export class PdfJsTextFragmentMapper extends GuardedAdapter
    implements ITextFragmentMapper<PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport> {

    public map(
        pageNumber: number,
        index: number,
        item: PdfJsNativeTextItem,
        content: PdfJsNativeTextContent,
        viewport: PdfJsNativeViewport
    ): IPdfFragment | null {
        if (!this.isTextItem(item)) {
            return null;
        }

        const text = this.normalizeText(item.str);
        if (text.length === 0) {
            return null;
        }

        const transform = this.transform(viewport.transform, item.transform);
        const fontName = this.resolveRawFontName(item);
        const fontFamily = this.resolveFontFamily(fontName, content.styles);
        const fontSize = this.resolveFontSize(transform);

        const fragment = new TextFragment({
            index,
            pageNumber,
            rectangle: Rectangle.create({
                id: `p${pageNumber}-${index}`,
                position: Point.create(
                    this.toFiniteNumber(transform[4]),
                    this.toFiniteNumber(transform[5])
                ),
                width: this.resolveWidth(item, viewport),
                height: this.resolveHeight(item, transform),
            }),
            text,
            fontName: fontName ?? undefined,
            fontFamily: fontFamily ?? undefined,
            fontSize: fontSize > 0 ? fontSize : undefined,
        });

        return fragment.toSource();
    }

    private resolveWidth(item: PdfJsNativeTextItem, viewport: PdfJsNativeViewport): number {
        return this.toFiniteNumber(item.width) * viewport.scale;
    }

    private resolveHeight(item: PdfJsNativeTextItem, transform: readonly number[]): number {
        const explicit = this.toFiniteNumber(item.height);
        if (explicit > 0) {
            return explicit;
        }

        return Math.hypot(
            this.toFiniteNumber(transform[2]),
            this.toFiniteNumber(transform[3])
        );
    }

    private resolveFontSize(transform: readonly number[]): number {
        const vertical = Math.hypot(
            this.toFiniteNumber(transform[2]),
            this.toFiniteNumber(transform[3])
        );

        if (vertical > 0) {
            return vertical;
        }

        return Math.hypot(
            this.toFiniteNumber(transform[0]),
            this.toFiniteNumber(transform[1])
        );
    }

    private resolveFontFamily(
        fontName: string | undefined,
        styles: Readonly<Record<string, PdfJsNativeTextStyle>> | undefined
    ): string | undefined {
        if (fontName === undefined || styles === undefined) {
            return undefined;
        }

        const style = styles[fontName];
        return typeof style?.fontFamily === "string" ? style.fontFamily : undefined;
    }

    private resolveRawFontName(item: PdfJsNativeTextItem): string | undefined {
        const candidate = item.fontInformation ?? item.fontName;

        if (typeof candidate === "string") {
            return candidate;
        }

        if (typeof candidate === "object" && candidate !== null) {
            const record = candidate as Record<string, unknown>;

            if (typeof record["rawName"] === "string") {
                return record["rawName"];
            }

            if (typeof record["name"] === "string") {
                return record["name"];
            }
        }

        return undefined;
    }

    private isTextItem(value: unknown): value is PdfJsNativeTextItem {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const candidate = value as Partial<PdfJsNativeTextItem>;
        return typeof candidate.str === "string"
            && Array.isArray(candidate.transform)
            && candidate.transform.length >= 6;
    }

    private normalizeText(value: string): string {
        return value.replace(/\s+/g, " ").trim();
    }

    private transform(left: readonly number[], right: readonly number[]): readonly number[] {
        const a0 = this.toFiniteNumber(left[0]);
        const a1 = this.toFiniteNumber(left[1]);
        const a2 = this.toFiniteNumber(left[2]);
        const a3 = this.toFiniteNumber(left[3]);
        const a4 = this.toFiniteNumber(left[4]);
        const a5 = this.toFiniteNumber(left[5]);

        const b0 = this.toFiniteNumber(right[0]);
        const b1 = this.toFiniteNumber(right[1]);
        const b2 = this.toFiniteNumber(right[2]);
        const b3 = this.toFiniteNumber(right[3]);
        const b4 = this.toFiniteNumber(right[4]);
        const b5 = this.toFiniteNumber(right[5]);

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
