import {
  STYLE_TOKENS,
  StyleFactory,
  StyleLibrary,
  StyleResolver,
  type IStyle,
  type IStyleReference,
} from "@monorepo/core-style-system";
import { UI_TOKENS } from "./ui-tokens.js";

export interface IStyleTokenResolver {
  resolve(reference: Readonly<IStyleReference>): IStyle;
}

export class SequencerStyleTokenResolver implements IStyleTokenResolver {
  private readonly factory: StyleFactory;

  public constructor() {
    const base = new StyleLibrary(STYLE_TOKENS);
    const sequencer = new StyleLibrary(UI_TOKENS);
    this.factory = new StyleFactory(new StyleResolver([base, sequencer]));
  }

  public resolve(reference: Readonly<IStyleReference>): IStyle {
    return this.factory.resolve(reference);
  }
}
