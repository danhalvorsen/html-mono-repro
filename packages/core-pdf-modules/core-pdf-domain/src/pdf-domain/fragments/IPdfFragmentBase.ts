import type { IPdfFragment } from "./IPdfFragment.js";
import type { PdfFragmentKind } from "./PdfFragmentKind.js";

export type IPdfFragmentBase<TKind extends PdfFragmentKind = PdfFragmentKind> =
  IPdfFragment & {
    readonly kind: TKind;
  };
