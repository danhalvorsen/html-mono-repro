import type { IFontInformation } from "../../core/IFontInformation.js";
import type { IPdfFragment } from "./IPdfFragment.js";
import { FragmentKinds } from "./PdfFragmentKind.js";

export interface IPdfTextFragment extends IPdfFragment {
  readonly kind: typeof FragmentKinds.Text;
  readonly rawText?: string | undefined;
  readonly text: string;
  readonly font?: IFontInformation | undefined;
  readonly textType?: string | undefined;
  readonly textSize?: number | undefined;
  readonly fontName?: string | undefined;
  readonly fontFamily?: string | undefined;
  readonly fontSize?: number | undefined;
}
