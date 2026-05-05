import type { IPdfFragment } from "./IPdfFragment.js";
import type { IPdfPathSegment } from "./IPdfPathSegment.js";
import { FragmentKinds } from "./PdfFragmentKind.js";

export interface IPdfPathFragment extends IPdfFragment {
  readonly kind: typeof FragmentKinds.Path;
  readonly segments: readonly IPdfPathSegment[];
}
