import { RectSemantic } from "./RectSemantic.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";
import type { RectBuilder } from "./RectBuilder.js";
import type {
  IBottomSemanticSelector,
  ILeftSemanticSelector,
  IRightSemanticSelector,
  ISemanticSelectorRoot,
  ITopSemanticSelector,
} from "./ISemanticSelectors.js";

export interface IRectBuilderSemanticHost {
  addPointPlacement(point: RectSemanticPoint): RectBuilder;
}

class TopSemanticSelector implements ITopSemanticSelector {
  public constructor(private readonly owner: IRectBuilderSemanticHost) {}
  public Left(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Top.Left); }
  public Mid(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Top.Mid); }
  public Right(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Top.Right); }
}

class RightSemanticSelector implements IRightSemanticSelector {
  public constructor(private readonly owner: IRectBuilderSemanticHost) {}
  public Start(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Right.Start); }
  public Mid(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Right.Mid); }
  public End(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Right.End); }
}

class BottomSemanticSelector implements IBottomSemanticSelector {
  public constructor(private readonly owner: IRectBuilderSemanticHost) {}
  public Left(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Bottom.Left); }
  public Mid(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Bottom.Mid); }
  public Right(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Bottom.Right); }
}

class LeftSemanticSelector implements ILeftSemanticSelector {
  public constructor(private readonly owner: IRectBuilderSemanticHost) {}
  public Start(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Left.Start); }
  public Mid(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Left.Mid); }
  public End(): RectBuilder { return this.owner.addPointPlacement(RectSemantic.Left.End); }
}

export class SemanticSelectorRoot implements ISemanticSelectorRoot {
  public readonly Top: ITopSemanticSelector;
  public readonly Right: IRightSemanticSelector;
  public readonly Bottom: IBottomSemanticSelector;
  public readonly Left: ILeftSemanticSelector;

  public constructor(owner: IRectBuilderSemanticHost) {
    this.Top = new TopSemanticSelector(owner);
    this.Right = new RightSemanticSelector(owner);
    this.Bottom = new BottomSemanticSelector(owner);
    this.Left = new LeftSemanticSelector(owner);
  }
}
