import type { IFillStyle } from "./IFillStyle.js";
import type { IStyle } from "./IStyle.js";
import type { IStyleLibrary } from "./IStyleLibrary.js";
import type { IStyleReference } from "./IStyleReference.js";
import type { IStyleResolver } from "./IStyleResolver.js";
import type { IStyleToken } from "./IStyleToken.js";
import type { IStrokeStyle } from "./IStrokeStyle.js";

export class StyleResolver implements IStyleResolver {
  public constructor(
    private readonly libraries: readonly IStyleLibrary[],
  ) {}

  public resolve(reference?: Readonly<IStyleReference>): IStyle {
    const tokenStyle =
      reference?.token !== undefined
        ? this.resolveToken(reference.token, new Set<string>())
        : {};

    return this.merge(tokenStyle, reference?.overrides);
  }

  private resolveToken(
    tokenName: string,
    visited: Set<string>,
  ): IStyle {
    if (visited.has(tokenName)) {
      throw new Error(
        `Circular style token inheritance detected for '${tokenName}'.`,
      );
    }

    const token = this.findToken(tokenName);

    if (token === null) {
      throw new Error(`Unknown style token '${tokenName}'.`);
    }

    visited.add(tokenName);

    let result: IStyle = {};

    for (const parentName of token.extends ?? []) {
      result = this.merge(result, this.resolveToken(parentName, visited));
    }

    visited.delete(tokenName);

    return this.merge(result, token.style);
  }

  private findToken(tokenName: string): IStyleToken | null {
    for (let index = this.libraries.length - 1; index >= 0; index -= 1) {
      const library = this.libraries[index];

      if (library === undefined) {
        continue;
      }

      const token = library.tokens[tokenName];

      if (token !== undefined) {
        return token;
      }
    }

    return null;
  }

  private merge(
    base?: Readonly<IStyle>,
    override?: Readonly<IStyle>,
  ): IStyle {
    const stroke = this.mergeStroke(base?.stroke, override?.stroke);
    const fill = this.mergeFill(base?.fill, override?.fill);
    const opacity = override?.opacity ?? base?.opacity;

    return {
      ...(stroke !== undefined ? { stroke } : {}),
      ...(fill !== undefined ? { fill } : {}),
      ...(opacity !== undefined ? { opacity } : {}),
    };
  }

  private mergeStroke(
    base?: Readonly<IStrokeStyle>,
    override?: Readonly<IStrokeStyle>,
  ): IStrokeStyle | undefined {
    const color = override?.color ?? base?.color;
    const width = override?.width ?? base?.width;
    const dash = override?.dash ?? base?.dash;

    if (color === undefined && width === undefined && dash === undefined) {
      return undefined;
    }

    return {
      ...(color !== undefined ? { color } : {}),
      ...(width !== undefined ? { width } : {}),
      ...(dash !== undefined ? { dash } : {}),
    };
  }

  private mergeFill(
    base?: Readonly<IFillStyle>,
    override?: Readonly<IFillStyle>,
  ): IFillStyle | undefined {
    const color = override?.color ?? base?.color;

    if (color === undefined) {
      return undefined;
    }

    return { color };
  }
}
