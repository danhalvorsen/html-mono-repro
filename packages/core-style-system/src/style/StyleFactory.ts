import type { IStyle } from "./IStyle.js";
import type { IStyleReference } from "./IStyleReference.js";
import type { IStyleResolver } from "./IStyleResolver.js";

export interface IStyleFactory {
  resolve(reference?: Readonly<IStyleReference>): IStyle;
}

export class StyleFactory implements IStyleFactory {
  public constructor(
    private readonly resolver: IStyleResolver,
  ) {}

  public resolve(reference?: Readonly<IStyleReference>): IStyle {
    return this.resolver.resolve(reference);
  }
}
