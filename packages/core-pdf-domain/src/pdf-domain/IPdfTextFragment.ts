import type { IPdfFragmentBase } from "./IPdfFragmentBase.js";

export interface IPdfTextFragment extends IPdfFragmentBase<"text"> {
  readonly rawText?: string | undefined;
  readonly text: string;
  readonly textType?: string | undefined;
  readonly textSize?: number | undefined;
  readonly fontName?: string | undefined;
  readonly fontFamily?: string | undefined;
  readonly fontSize?: number | undefined;
}
