import type { IPdfFragmentBase } from "./IPdfFragmentBase.js";

export interface IPdfImageFragment extends IPdfFragmentBase<"image"> {
  readonly name?: string | undefined;
  readonly mimeType?: string | undefined;
  readonly bytes?: Uint8Array | undefined;
}
