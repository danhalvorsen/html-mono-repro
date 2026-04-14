// src/engine/IPdfPage.ts

import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";

export interface IPdfPage {
  readonly pageNumber: number;
  readTextFragments(): Promise<readonly IPdfTextFragment[]>;
  readText(): Promise<IPdfPageText>;
}
