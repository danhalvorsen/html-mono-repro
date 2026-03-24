// ====================================================================================
// FILE: Applications/composite-tree-demo/composite-tree/src/SceneGraph/DrawableShapeProjector.ts
// app side
// ====================================================================================

import type { ISceneNode, ISceneProjector, ShapeNode } from "@monorepo/core-scene-graph";
import type { DrawableShape } from "../DrawableShape.js";
import { CircleShape, RectangleShape } from "../Shapes/shape-model.js";
import { Vector2 } from "@monorepo/core-math";
import type { ShapePayload } from "./ShapePayload.js";

export class DrawableShapeProjector implements ISceneProjector<DrawableShape> {
  public project(node: ISceneNode): readonly DrawableShape[] {
    const shapeNode = node as ShapeNode<ShapePayload>;

    if (shapeNode.payload === undefined) {
      return [];
    }

    const payload = shapeNode.payload;
    const m = node.world.toFloat32Array();
    const center = new Vector2(m[2] ?? 0, m[5] ?? 0);

    switch (payload.kind) {
      case "circle":
        return [new CircleShape(center, payload.radius)];

      case "rectangle":
        return [new RectangleShape(center, payload.width, payload.height)];

      default:
        return [];
    }
  }
}