import type { IStyle } from "./IStyle.js";

export interface IStyleToken {
  readonly name: string;
  readonly extends?: readonly string[];
  readonly style: Readonly<IStyle>;
}