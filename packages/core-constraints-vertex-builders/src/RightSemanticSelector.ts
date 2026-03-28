import type { IRectBuilderInternal } from "./IRectBuilderInternal.js";
import type { ISemanticPointSelector } from "./ISemanticPointSelector.js";
import type { RectBuilder } from "./RectBuilder.js";
import { RectSemantic } from "./RectSemantic.js";

export class RightSemanticSelector implements ISemanticPointSelector {
  public constructor(
    private readonly owner: IRectBuilderInternal
  ) { }

  public Left(): RectBuilder {
    throw new Error("Right.Left is not supported. Use Right.Start.");
  }

  public Mid(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Right.Mid);
  }

  public Right(): RectBuilder {
    throw new Error("Right.Right is not supported. Use Right.End.");
  }

  public Start(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Right.Start);
  }

  public End(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Right.End);
  }
}
