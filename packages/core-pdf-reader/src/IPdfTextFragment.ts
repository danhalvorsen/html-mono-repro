// src/IPdfTextFragment.ts

import type { IFontInformation } from "./IFontInformation.js";

export interface IPdfTextFragment {
  readonly pageNumber: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly font?: IFontInformation;
  readonly fontName?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}