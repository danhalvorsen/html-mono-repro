import type { IBoundingBox } from "./contracts/contracts.js";

export interface IPdfImageFragment {
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly name?: string;
  readonly mimeType?: string;
  readonly bytes?: Uint8Array;
}