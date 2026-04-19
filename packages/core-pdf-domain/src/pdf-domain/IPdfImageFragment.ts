import type { IBoundingBox } from "../core/IBoundingBox.js";

export interface IPdfImageFragment {
  readonly kind: "image";
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly name?: string | undefined;
  readonly mimeType?: string | undefined;
  readonly bytes?: Uint8Array | undefined;
}