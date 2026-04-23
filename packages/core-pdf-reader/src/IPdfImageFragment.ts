import type { IBoundingBox } from "@monorepo/core-pdf-domain";

export interface IPdfImageFragment {
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly name?: string;
  readonly mimeType?: string;
  readonly bytes?: Uint8Array;
}
