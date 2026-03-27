import type { IRectBuilderInternal } from "./IRectBuilderInternal";
import type { ISemanticPointSelector } from "./ISemanticPointSelector";
import type { RectBuilder } from "./RectBuilder";
import { RectSemantic } from "./RectSemantic";

export class LeftSemanticSelector implements ISemanticPointSelector {
  public constructor(
    private readonly owner: IRectBuilderInternal
  ) { }

  public Left(): RectBuilder {
    throw new Error("Left.Left is not supported. Use Left.Start.");
  }

  public Mid(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Left.Mid);
  }

  public Right(): RectBuilder {
    throw new Error("Left.Right is not supported. Use Left.End.");
  }

  public Start(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Left.Start);
  }

  public End(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Left.End);
  }
}
