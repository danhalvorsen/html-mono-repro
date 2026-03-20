import type { Point } from "@monorepo/core-math";
import type { IStyleReference } from "@monorepo/core-style-system";
import { ShapeIds, StyleReferences } from "../shape-model";
import type { IEllipseShape } from "./IEllipseShape";

export class EllipseShape implements IEllipseShape {
  public readonly id: string;
  public readonly kind = "ellipse" as const;
  public readonly style: Readonly<IStyleReference>;

  public constructor(
    public readonly center: Point,
    public readonly radiusX: number,
    public readonly radiusY: number,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create("ellipse");
    this.style = StyleReferences.withDefault(style, "surface");
  }
}
