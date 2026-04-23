import type { FragmentKind } from "../core/FragmentKind.js";
import type { IBoundingBox } from "../core/IBoundingBox.js";

export interface IPdfFragmentBase<TKind extends FragmentKind = FragmentKind> {
  readonly kind: TKind;
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
}
