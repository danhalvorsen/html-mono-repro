import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export interface IPidFragment<TKind extends PidFragmentKind = PidFragmentKind> {
  readonly pidKind: TKind;
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly sourceFragments: readonly PdfFragment[];
}