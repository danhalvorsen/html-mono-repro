// src/IPdfTextFragment.ts

import type { IFontInformation } from "../IFontInformation.js";
import type { IBoundingBox } from "../contracts/contracts.js";

export interface IPdfTextFragment {
  readonly pageNumber: number;
  readonly text: string;
  readonly boundingBox: IBoundingBox;
  readonly font?: IFontInformation;
  readonly fontName?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}