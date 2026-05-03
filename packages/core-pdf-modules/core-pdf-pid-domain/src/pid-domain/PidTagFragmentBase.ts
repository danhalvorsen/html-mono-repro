import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidTagFragment } from "./IPidTagFragment.js";
import { PidFragmentBase } from "./PidFragmentBase.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";
import { PidTagTextNormalizer, type IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export abstract class PidTagFragmentBase<TKind extends PidFragmentKind>
  extends PidFragmentBase<TKind>
  implements IPidTagFragment<TKind> {
  public readonly text: string;
  public readonly normalizedText: string;
  public readonly confidence: number;

  protected constructor(params: {
    readonly pidKind: TKind;
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: params.pidKind,
      pageNumber: params.pageNumber,
      boundingBox: params.boundingBox,
      sourceFragments: params.sourceFragments,
    });

    this.ensureText(params.text);

    const confidence = params.confidence ?? 1;
    this.ensureConfidence(confidence);

    const textNormalizer = params.textNormalizer ?? new PidTagTextNormalizer();

    this.text = params.text;
    this.normalizedText = textNormalizer.normalize(params.text);
    this.confidence = confidence;
  }

  private ensureText(value: string): void {
    if (value.trim().length === 0) {
      throw new Error("text must not be empty.");
    }
  }

  private ensureConfidence(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("confidence must be a finite number between 0 and 1.");
    }
  }
}