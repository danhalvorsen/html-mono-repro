import { RectBuilder } from "../../src/RectBuilder.js";
import { RectSemantic } from "../../src/RectSemantic.js";

export class RectBuilderFixture {
  public createSingle(): RectBuilder {
    return new RectBuilder().Add(2, 2, 1);
  }

  public createHorizontalPair(): RectBuilder {
    return new RectBuilder().Add(2, 2, 1).Right();
  }

  public createSemanticPair(): RectBuilder {
    return new RectBuilder().Add(2, 2, 1).Add(2, 2, 1).At.Top.Left();
  }

  public createRotatedSingle(): RectBuilder {
    return new RectBuilder().Add(2, 2, 1).Rotate(RectSemantic.Top.Left, 45);
  }
}
