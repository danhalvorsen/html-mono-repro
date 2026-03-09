import type { IDrawableShape, ShapeId, ShapeType } from "@monorepo/core-new-shapes-abstract";
import type { Mesh } from "three";
import type { IBuilder } from "../contracts/IBuilder.js";
import type { IShapeFactory } from "../contracts/IShapeFactory.js";
import type { ThreeDrawContext } from "../three/ThreeDrawContext.js";

export class ThreeDrawableShapeFactory implements IShapeFactory<ThreeDrawContext> {

  public constructor(
    private readonly type: string,
    private readonly meshBuilder: IBuilder<Mesh>
  ) {}

  public make(): IDrawableShape<ThreeDrawContext> {

    const mesh = this.meshBuilder.build();

    let attached = false;

    const id = crypto.randomUUID() as ShapeId;
    const type = this.type as ShapeType;

    return {
      id,
      type,

      draw(ctx: ThreeDrawContext): void {

        if (!attached) {
          ctx.scene.add(mesh);
          attached = true;
        }

      }
    };
  }
}