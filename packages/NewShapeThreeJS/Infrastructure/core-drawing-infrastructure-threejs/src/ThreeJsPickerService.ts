import { Raycaster, Vector2 as ThreeVector2 } from "three";
import type { Vector2 } from "@monorepo/core-math";
import type { IPickerService } from "@monorepo/core-drawing-infrastructure-abstract";
import type { IThreePickContext } from "./IThreePickContext.js";
import type { IObjectShapeResolver } from "./IObjectShapeResolver.js";

export class ThreeJsPickerService<TShape> implements IPickerService<TShape> {
  private readonly raycaster: Raycaster;
  private readonly ndc = new ThreeVector2();

  public constructor(
    private readonly context: IThreePickContext,
    private readonly resolver: IObjectShapeResolver<TShape>,
    raycaster?: Raycaster
  ) {
    this.raycaster = raycaster ?? new Raycaster();
  }

  public pick(point: Vector2): TShape | undefined {
    const width = this.context.viewport.size.x;
    const height = this.context.viewport.size.y;

    if (width <= 0) {
      throw new Error("Viewport width must be greater than zero.");
    }

    if (height <= 0) {
      throw new Error("Viewport height must be greater than zero.");
    }

    this.ndc.set(
      (point.x / width) * 2 - 1,
      -(point.y / height) * 2 + 1
    );

    this.raycaster.setFromCamera(this.ndc, this.context.camera);

    const hits = this.raycaster.intersectObjects([...this.context.objects], true);

    for (const hit of hits) {
      const shape = this.resolver.resolveIdentifierKey(hit.object);
      if (shape !== undefined) {
        return shape;
      }
    }

    return undefined;
  }
}