import type { RectBuilder } from "./RectBuilder.js";

export interface ISemanticPointSelector {
  Left(): RectBuilder;
  Mid(): RectBuilder;
  Right(): RectBuilder;
  Start(): RectBuilder;
  End(): RectBuilder;
}
