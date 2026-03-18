import type { IStyleToken } from "./IStyleToken.js";

export interface IStyleLibrary {
  readonly tokens: Readonly<Record<string, IStyleToken>>;
}
