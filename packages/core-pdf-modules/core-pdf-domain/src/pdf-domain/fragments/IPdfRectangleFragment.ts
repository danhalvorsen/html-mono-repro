import type { IPdfFragment } from "./IPdfFragment.js";
import { FragmentKinds } from "./PdfFragmentKind.js";

export interface IPdfRectangleFragment extends IPdfFragment {
  readonly kind: typeof FragmentKinds.Rectangle;
}
