import type { IPdfFragment } from "./IPdfFragment.js";
import { FragmentKinds } from "./PdfFragmentKind.js";

export interface IPdfImageFragment extends IPdfFragment {
  readonly kind: typeof FragmentKinds.Image;
  readonly name?: string | undefined;
  readonly mimeType?: string | undefined;
  readonly bytes?: Uint8Array | undefined;
}
