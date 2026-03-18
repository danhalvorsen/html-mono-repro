// ============================================================================
// FILE: tests/fixtures/LayoutBoxModelFixture.ts
// UPDATE: include border + use index import
// ============================================================================

import {
  LayoutBoxModel,
  type IThickness,
} from "../../src/index.js";

export class LayoutBoxModelFixture {
  public readonly margin: IThickness;
  public readonly padding: IThickness;
  public readonly border: IThickness;
  public readonly sut: LayoutBoxModel;

  public constructor(
    options?: Readonly<{
      margin?: IThickness;
      padding?: IThickness;
      border?: IThickness;
    }>,
  ) {
    this.margin =
      options?.margin ?? { top: 10, right: 20, bottom: 30, left: 40 };

    this.padding =
      options?.padding ?? { top: 1, right: 2, bottom: 3, left: 4 };

    this.border =
      options?.border ?? { top: 5, right: 6, bottom: 7, left: 8 };

    this.sut = new LayoutBoxModel(
      this.margin,
      this.padding,
      this.border,
    );
  }
}