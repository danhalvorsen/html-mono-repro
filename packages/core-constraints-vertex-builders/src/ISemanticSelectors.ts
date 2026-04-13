import type { RectBuilder } from "./RectBuilder.js";

export interface ITopSemanticSelector {
  Left(): RectBuilder;
  Mid(): RectBuilder;
  Right(): RectBuilder;
}

export interface IRightSemanticSelector {
  Start(): RectBuilder;
  Mid(): RectBuilder;
  End(): RectBuilder;
}

export interface IBottomSemanticSelector {
  Left(): RectBuilder;
  Mid(): RectBuilder;
  Right(): RectBuilder;
}

export interface ILeftSemanticSelector {
  Start(): RectBuilder;
  Mid(): RectBuilder;
  End(): RectBuilder;
}

export interface ISemanticSelectorRoot {
  readonly Top: ITopSemanticSelector;
  readonly Right: IRightSemanticSelector;
  readonly Bottom: IBottomSemanticSelector;
  readonly Left: ILeftSemanticSelector;
}
