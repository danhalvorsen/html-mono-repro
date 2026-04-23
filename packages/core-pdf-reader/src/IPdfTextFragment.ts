// src/IPdfTextFragment.ts

import type { IFontInformation } from "./IFontInformation.js";
import type { IBoundingBox } from "@monorepo/core-pdf-domain";

export interface IPdfTextFragment {
  readonly pageNumber: number;
  readonly rawText: string;
  readonly text: string;
  readonly textType: string;
  readonly textSize: number;
  readonly boundingBox: IBoundingBox;
  readonly font?: IFontInformation;
  readonly fontName?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}
