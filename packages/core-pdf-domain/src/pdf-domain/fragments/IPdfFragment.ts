import type { IPdfImageFragment } from "./IPdfImageFragment.js";
import type { IFragment } from "./IFragment.js";
import type { IPdfRectangleFragment } from "./IPdfRectangleFragment.js";
import type { IPdfTextFragment } from "./IPdfTextFragment.js";
import type { FragmentKind } from "./PdfFragmentKind.js";

export interface IPdfFragment extends IFragment {
  readonly kind: FragmentKind;
}

export type PdfFragment =
  | IPdfTextFragment
  | IPdfImageFragment
  | IPdfRectangleFragment;

export type AnyPdfFragmentBase = IPdfFragment;
