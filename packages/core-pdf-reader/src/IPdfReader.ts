import type { IPdfBinarySource } from "./IPdfBinarySource.js";
import type { IPdfPageText } from "./IPdfPageText.js";

export interface IPdfReader {
  readonly read: (source: IPdfBinarySource) => Promise<readonly IPdfPageText[]>;
}