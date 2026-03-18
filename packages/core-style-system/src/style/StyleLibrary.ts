
import type { IStyleLibrary } from "./IStyleLibrary.js";
import type { IStyleToken } from "./IStyleToken.js";

export class StyleLibrary implements IStyleLibrary {
  public readonly tokens: Readonly<Record<string, IStyleToken>>;

  public constructor(tokens: Readonly<Record<string, IStyleToken>>) {
    this.tokens = Object.freeze({ ...tokens });
  }
}