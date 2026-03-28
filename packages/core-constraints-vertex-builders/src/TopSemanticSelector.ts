import type { IRectBuilderInternal } from "./IRectBuilderInternal.js";
import type { ISemanticPointSelector } from "./ISemanticPointSelector.js";
import type { RectBuilder } from "./RectBuilder.js";
import { RectSemantic } from "./RectSemantic.js";

export class TopSemanticSelector implements ISemanticPointSelector {
  public constructor(
    private readonly owner: IRectBuilderInternal
  ) { }

  public Left(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Top.Left);
  }

  public Mid(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Top.Mid);
  }

  public Right(): RectBuilder {
    return this.owner.addPointPlacement(RectSemantic.Top.Right);
  }

  public Start(): RectBuilder {
    throw new Error("Top.Start is not supported. Use Top.Left.");
  }

  public End(): RectBuilder {
    throw new Error("Top.End is not supported. Use Top.Right.");
  }
}
