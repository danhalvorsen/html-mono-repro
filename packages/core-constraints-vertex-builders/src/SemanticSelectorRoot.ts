 
import { IRectBuilderInternal } from "./IRectBuilderInternal.js";
import { ISemanticPointSelector } from "./ISemanticPointSelector.js";
import { TopSemanticSelector } from "./TopSemanticSelector.js";
import { RightSemanticSelector } from "./RightSemanticSelector.js";
import { BottomSemanticSelector } from "./BottomSemanticSelector.js";
import { LeftSemanticSelector } from "./LeftSemanticSelector.js";
 
export interface ISemanticSelectorRoot { readonly Top: ISemanticPointSelector; readonly Right: ISemanticPointSelector; readonly Bottom: ISemanticPointSelector; readonly Left: ISemanticPointSelector; }

export class SemanticSelectorRoot implements ISemanticSelectorRoot {
  public readonly Top: ISemanticPointSelector;
  public readonly Right: ISemanticPointSelector;
  public readonly Bottom: ISemanticPointSelector;
  public readonly Left: ISemanticPointSelector;

  public constructor(owner: IRectBuilderInternal) {
    this.Top = new TopSemanticSelector(owner);
    this.Right = new RightSemanticSelector(owner);
    this.Bottom = new BottomSemanticSelector(owner);
    this.Left = new LeftSemanticSelector(owner);
  }
}
