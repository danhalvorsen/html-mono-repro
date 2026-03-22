// ====================================================================================
// FILE: packages/core-scene-graph/tests/fixtures/SceneGraphFixture.ts
// ====================================================================================

import { Matrix, type IMatrix } from "@monorepo/core-math";
import {
  SceneGraph,
  SceneNode,
  ShapeNode,
  SceneProjector,
  type ISceneProjector,
  type ISceneNode,
} from "../../src/index.js";

export type TestPayload = Readonly<{
  kind: "point";
  value: string;
}>;

export type ProjectedNode = Readonly<{
  name: string;
  value: string;
  x: number;
  y: number;
}>;

export class TestProjector implements ISceneProjector<ProjectedNode> {
  public project(node: ISceneNode): readonly ProjectedNode[] {
    if (!(node instanceof ShapeNode)) {
      return [];
    }

    const shapeNode = node as ShapeNode<TestPayload>;
    const translation = SceneGraphFixture.readTranslationFromMatrix(shapeNode.world);

    return [
      {
        name: shapeNode.name,
        value: shapeNode.payload.value,
        x: translation.x,
        y: translation.y,
      },
    ];
  }
}

export class SceneGraphFixture {
  public createSceneNode(name: string = "node"): SceneNode {
    return new SceneNode(name);
  }

  public createShapeNode(
    name: string = "shape",
    payload: TestPayload = { kind: "point", value: "default" },
  ): ShapeNode<TestPayload> {
    return new ShapeNode<TestPayload>(name, payload);
  }

  public createGraph(root?: ISceneNode): SceneGraph {
    return new SceneGraph(root ?? this.createSceneNode("root"));
  }

  public createProjector(): SceneProjector<ProjectedNode> {
    return new SceneProjector<ProjectedNode>(new TestProjector());
  }

  public createIdentityMatrix(): IMatrix {
    return Matrix.identity(3);
  }

  public createTranslationMatrix(x: number, y: number): IMatrix {
    return Matrix.translation(x, y);
  }

  public createRotationMatrix(radians: number): IMatrix {
    return Matrix.rotation(radians);
  }

  public createScaleMatrix(sx: number, sy: number): IMatrix {
    return Matrix.scaling(sx, sy);
  }

  public createSkewMatrix(skewX: number, skewY: number): IMatrix {
    return new Matrix([
      [1, skewX, 0],
      [skewY, 1, 0],
      [0, 0, 1],
    ]);
  }

  public createRootWithChild(): {
    root: SceneNode;
    child: SceneNode;
  } {
    const root = this.createSceneNode("root");
    const child = this.createSceneNode("child");

    root.add(child);

    return { root, child };
  }

  public createRootWithShapeLeaf(): {
    root: SceneNode;
    leaf: ShapeNode<TestPayload>;
  } {
    const root = this.createSceneNode("root");
    const leaf = this.createShapeNode("leaf", { kind: "point", value: "A" });

    root.add(leaf);

    return { root, leaf };
  }

  public createNestedGraph(): {
    root: SceneNode;
    groupA: SceneNode;
    groupB: SceneNode;
    leafA: ShapeNode<TestPayload>;
    leafB: ShapeNode<TestPayload>;
    graph: SceneGraph;
  } {
    const root = this.createSceneNode("root");
    const groupA = this.createSceneNode("group-a");
    const groupB = this.createSceneNode("group-b");
    const leafA = this.createShapeNode("leaf-a", { kind: "point", value: "A" });
    const leafB = this.createShapeNode("leaf-b", { kind: "point", value: "B" });

    root.add(groupA);
    root.add(groupB);
    groupA.add(leafA);
    groupB.add(leafB);

    return {
      root,
      groupA,
      groupB,
      leafA,
      leafB,
      graph: this.createGraph(root),
    };
  }

  public createTranslatedGraph(): {
    root: SceneNode;
    child: SceneNode;
    leaf: ShapeNode<TestPayload>;
    graph: SceneGraph;
  } {
    const root = this.createSceneNode("root");
    const child = this.createSceneNode("child");
    const leaf = this.createShapeNode("leaf", { kind: "point", value: "A" });

    root.translate(10, 20);
    child.translate(5, 7);
    leaf.translate(2, 3);

    root.add(child);
    child.add(leaf);

    return { root, child, leaf, graph: this.createGraph(root) };
  }

  public static readTranslationFromMatrix(matrix: IMatrix): { x: number; y: number } {
    const values = matrix.toFloat32Array();

    return {
      x: values[2] ?? 0,
      y: values[5] ?? 0,
    };
  }

  public static readApproximateRotationFromMatrix(matrix: IMatrix): number {
    const values = matrix.toFloat32Array();
    return Math.atan2(values[3] ?? 0, values[0] ?? 1);
  }

  public static readApproximateScaleFromMatrix(matrix: IMatrix): { x: number; y: number } {
    const values = matrix.toFloat32Array();

    const scaleX = Math.sqrt(((values[0] ?? 0) ** 2) + ((values[3] ?? 0) ** 2));
    const scaleY = Math.sqrt(((values[1] ?? 0) ** 2) + ((values[4] ?? 0) ** 2));

    return { x: scaleX, y: scaleY };
  }

  public traverseNames(graph: SceneGraph): string[] {
    const names: string[] = [];

    graph.traverse((node) => {
      names.push(node.name);
    });

    return names;
  }
}