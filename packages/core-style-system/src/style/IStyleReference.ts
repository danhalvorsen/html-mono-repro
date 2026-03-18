import type { IStyle } from "./IStyle.js";

export interface IStyleReference {
  readonly token?: string;
  readonly overrides?: Readonly<IStyle>;
}