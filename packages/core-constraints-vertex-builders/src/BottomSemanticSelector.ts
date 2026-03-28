import type { IRectBuilderInternal } from "./IRectBuilderInternal.js";
import type { ISemanticPointSelector } from "./ISemanticPointSelector.js";
import type { RectBuilder } from "./RectBuilder.js";
import { RectSemantic } from "./RectSemantic.js";

export class BottomSemanticSelector implements ISemanticPointSelector {
  public constructor(
    private readonly owner: IRectBuilderInternal
  ) { }

  public Left(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Bottom.Left);
  }

  public Mid(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Bottom.Mid);
  }

  public Right(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Bottom.Right);
  }

  public Start(): RectBuilder {
    throw new Error("Bottom.Start is not supported. Use Bottom.Left.");
  }

  public End(): RectBuilder {
    throw new Error("Bottom.End is not supported. Use Bottom.Right.");
  }
}
