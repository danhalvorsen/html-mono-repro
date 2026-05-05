import { FragmentKinds, type PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPdfFragmentJsonSerializer } from "./IPdfFragmentJsonSerializer.js";

export class PdfFragmentJsonSerializer implements IPdfFragmentJsonSerializer {
  public serialize(engineName: string, fragments: readonly PdfFragment[]): Uint8Array {
    const normalized = this.normalizeForJson(fragments);

    const payload = Object.freeze({
      engine: engineName,
      generatedAt: new Date().toISOString(),
      totals: Object.freeze({
        fragments: normalized.length,
      }),
      fragments: normalized,
    });

    return new TextEncoder().encode(`${JSON.stringify(payload, null, 2)}\n`);
  }

  private normalizeForJson(
    fragments: readonly PdfFragment[],
  ): readonly {
    readonly id: string;
    readonly kind: PdfFragment["kind"];
    readonly pageNumber: number;
    readonly boundingBox: PdfFragment["boundingBox"];
    readonly text?: string;
    readonly fontName?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly segments?: readonly {
      readonly index: number;
      readonly operator: string;
      readonly boundingBox: PdfFragment["boundingBox"];
    }[];
  }[] {
    return Object.freeze(
      fragments.map((fragment, index) => Object.freeze({
        id: this.buildFragmentId(fragment, index),
        kind: fragment.kind,
        pageNumber: fragment.pageNumber,
        boundingBox: fragment.boundingBox,
        ...(fragment.kind === FragmentKinds.Text && { text: fragment.text }),
        ...(fragment.kind === FragmentKinds.Text && typeof fragment.fontName === "string" && {
          fontName: fragment.fontName,
        }),
        ...(fragment.kind === FragmentKinds.Text && typeof fragment.fontFamily === "string" && {
          fontFamily: fragment.fontFamily,
        }),
        ...(fragment.kind === FragmentKinds.Text && typeof fragment.fontSize === "number" && {
          fontSize: fragment.fontSize,
        }),
        ...(fragment.kind === FragmentKinds.Path && {
          segments: fragment.segments.map((segment) => ({
            index: segment.index,
            operator: segment.operator,
            boundingBox: segment.boundingBox,
          })),
        }),
      })),
    );
  }

  private buildFragmentId(fragment: PdfFragment, index: number): string {
    return `p${fragment.pageNumber}:${fragment.kind}:${index}`;
  }
}
