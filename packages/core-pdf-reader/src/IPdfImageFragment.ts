import type { IBoundingBox } from "@monorepo/core-pdf-common";

export interface IPdfImageFragment {
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly name?: string;
  readonly mimeType?: string;
  readonly bytes?: Uint8Array;
}