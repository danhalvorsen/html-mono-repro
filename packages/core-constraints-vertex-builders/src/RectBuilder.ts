import * as THREE from "three";
import { RectSemantic } from "./RectSemantic.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";
import { IRectBuilderInternal } from "./IRectBuilderInternal.js";
import { IRectState } from "./IRectState.js";
import { ISemanticSelectorRoot, SemanticSelectorRoot } from "./SemanticSelectorRoot.js";
 
import { IRectSize } from "./IRectSize.js";
import { Direction } from "./Direction.js";

export class RectBuilder implements IRectBuilderInternal {
  private readonly rects: ReadonlyArray<IRectState>;

  public constructor(rects?: ReadonlyArray<IRectState>) {
    this.rects = rects ?? [];
  }

  public get At(): ISemanticSelectorRoot {
    return new SemanticSelectorRoot(this);
  }

  public Add(width: number = 1, height: number = 1, depth: number = 1): RectBuilder {
    this.assertPositiveFinite(width, "width");
    this.assertPositiveFinite(height, "height");
    this.assertPositiveFinite(depth, "depth");

    const next: IRectState = Object.freeze({
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      size: Object.freeze({ width, height, depth }),
      rotationDegrees: 0,
      mode: "EdgeLocked",
    });

    return new RectBuilder(Object.freeze([...this.rects, next]));
  }

  public Left(count: number = 1): RectBuilder {
    return this.addPlacement("Left", count);
  }

  public Right(count: number = 1): RectBuilder {
    return this.addPlacement("Right", count);
  }

  public Top(count: number = 1): RectBuilder {
    return this.addPlacement("Top", count);
  }

  public Bottom(count: number = 1): RectBuilder {
    return this.addPlacement("Bottom", count);
  }

  public Rotate(pivot: RectSemanticPoint, angleDegrees: number): RectBuilder {
    if (!Number.isFinite(angleDegrees)) {
      throw new Error("angleDegrees must be a finite number.");
    }

    if (this.rects.length === 0) {
      throw new Error("Rotate requires at least one Rect.");
    }

    const rects = [...this.rects];
    const last = rects.at(-1)!;

    rects[rects.length - 1] = Object.freeze({
      ...last,
      pivot,
      rotationDegrees: angleDegrees,
      mode: "PivotAnchored",
    });

    return new RectBuilder(Object.freeze(rects));
  }

  public addPointPlacement(point: RectSemanticPoint): RectBuilder {
    if (this.rects.length < 2) {
      throw new Error("Point placement requires at least two Rects.");
    }

    const rects = [...this.rects];
    const current = rects.at(-2)!;
    const next = rects.at(-1)!;

    const targetPoint = this.getWorldSemanticPoint(current, point);
    const sourcePoint = this.getOppositeWorldSemanticPoint(next, point);

    rects[rects.length - 1] = Object.freeze({
      ...next,
      centerX: next.centerX + (targetPoint.x - sourcePoint.x),
      centerY: next.centerY + (targetPoint.y - sourcePoint.y),
    });

    return new RectBuilder(Object.freeze(rects));
  }

  public BuildGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    for (const rect of this.rects) {
      const vertices = this.createRectVertices(rect);

      for (const vertex of vertices) {
        positions.push(vertex.x, vertex.y, vertex.z);
      }

      uvs.push(
        0, 0,
        1, 0,
        0, 1,
        1, 1,

        0, 0,
        1, 0,
        0, 1,
        1, 1,
      );

      for (let index = 0; index < 8; index += 1) {
        normals.push(0, 0, 1);
      }

      indices.push(
        vertexOffset + 0, vertexOffset + 1, vertexOffset + 2,
        vertexOffset + 2, vertexOffset + 1, vertexOffset + 3,

        vertexOffset + 4, vertexOffset + 6, vertexOffset + 5,
        vertexOffset + 6, vertexOffset + 7, vertexOffset + 5,

        vertexOffset + 0, vertexOffset + 2, vertexOffset + 4,
        vertexOffset + 2, vertexOffset + 6, vertexOffset + 4,

        vertexOffset + 1, vertexOffset + 5, vertexOffset + 3,
        vertexOffset + 3, vertexOffset + 5, vertexOffset + 7,

        vertexOffset + 2, vertexOffset + 3, vertexOffset + 6,
        vertexOffset + 3, vertexOffset + 7, vertexOffset + 6,

        vertexOffset + 0, vertexOffset + 4, vertexOffset + 1,
        vertexOffset + 1, vertexOffset + 4, vertexOffset + 5,
      );

      vertexOffset += 8;
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  private addPlacement(direction: Direction, count: number): RectBuilder {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("count must be an integer greater than zero.");
    }

    if (this.rects.length === 0) {
      throw new Error(`${direction} requires at least one Rect.`);
    }

    let builder: RectBuilder = this;

    for (let index = 0; index < count; index += 1) {
      builder = builder.addSinglePlacement(direction);
    }

    return builder;
  }

  private addSinglePlacement(direction: Direction): RectBuilder {
    const rects = [...this.rects];
    const current = rects.at(-1)!;

    const next: IRectState = Object.freeze({
      centerX: current.centerX,
      centerY: current.centerY,
      centerZ: current.centerZ,
      size: current.size,
      rotationDegrees: 0,
      mode: "EdgeLocked",
    });

    rects.push(this.resolvePlacement(current, next, direction));
    return new RectBuilder(Object.freeze(rects));
  }

  private resolvePlacement(current: IRectState, next: IRectState, direction: Direction): IRectState {
    switch (direction) {
      case "Left":
        return Object.freeze({
          ...next,
          centerX: current.centerX - (current.size.width / 2) - (next.size.width / 2),
        });
      case "Right":
        return Object.freeze({
          ...next,
          centerX: current.centerX + (current.size.width / 2) + (next.size.width / 2),
        });
      case "Top":
        return Object.freeze({
          ...next,
          centerY: current.centerY + (current.size.height / 2) + (next.size.height / 2),
        });
      case "Bottom":
        return Object.freeze({
          ...next,
          centerY: current.centerY - (current.size.height / 2) - (next.size.height / 2),
        });
      default: {
        const exhaustive: never = direction;
        throw new Error(`Unsupported direction: ${String(exhaustive)}`);
      }
    }
  }

  private createRectVertices(rect: IRectState): ReadonlyArray<THREE.Vector3> {
    const halfWidth = rect.size.width / 2;
    const halfHeight = rect.size.height / 2;
    const halfDepth = rect.size.depth / 2;

    const localVertices = [
      new THREE.Vector3(-halfWidth, -halfHeight, -halfDepth),
      new THREE.Vector3(+halfWidth, -halfHeight, -halfDepth),
      new THREE.Vector3(-halfWidth, +halfHeight, -halfDepth),
      new THREE.Vector3(+halfWidth, +halfHeight, -halfDepth),
      new THREE.Vector3(-halfWidth, -halfHeight, +halfDepth),
      new THREE.Vector3(+halfWidth, -halfHeight, +halfDepth),
      new THREE.Vector3(-halfWidth, +halfHeight, +halfDepth),
      new THREE.Vector3(+halfWidth, +halfHeight, +halfDepth),
    ];

    const pivot = rect.pivot !== undefined
      ? this.getLocalSemanticPoint(rect.size, rect.pivot)
      : new THREE.Vector3(0, 0, 0);

    const radians = THREE.MathUtils.degToRad(-rect.rotationDegrees);
    const rotation = new THREE.Matrix4().makeRotationZ(radians);
    const translation = new THREE.Vector3(rect.centerX, rect.centerY, rect.centerZ);

    return localVertices.map((vertex) =>
      vertex.clone().sub(pivot).applyMatrix4(rotation).add(pivot).add(translation),
    );
  }

  private getWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): THREE.Vector3 {
    return this.getLocalSemanticPoint(rect.size, point).add(
      new THREE.Vector3(rect.centerX, rect.centerY, rect.centerZ),
    );
  }

  private getOppositeWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): THREE.Vector3 {
    return this.getLocalSemanticPoint(rect.size, this.getOppositePoint(point)).add(
      new THREE.Vector3(rect.centerX, rect.centerY, rect.centerZ),
    );
  }

  private getOppositePoint(point: RectSemanticPoint): RectSemanticPoint {
    switch (point) {
      case RectSemantic.Top.Left: return RectSemantic.Bottom.Left;
      case RectSemantic.Top.Mid: return RectSemantic.Bottom.Mid;
      case RectSemantic.Top.Right: return RectSemantic.Bottom.Right;
      case RectSemantic.Right.Start: return RectSemantic.Left.Start;
      case RectSemantic.Right.Mid: return RectSemantic.Left.Mid;
      case RectSemantic.Right.End: return RectSemantic.Left.End;
      case RectSemantic.Bottom.Left: return RectSemantic.Top.Left;
      case RectSemantic.Bottom.Mid: return RectSemantic.Top.Mid;
      case RectSemantic.Bottom.Right: return RectSemantic.Top.Right;
      case RectSemantic.Left.Start: return RectSemantic.Right.Start;
      case RectSemantic.Left.Mid: return RectSemantic.Right.Mid;
      case RectSemantic.Left.End: return RectSemantic.Right.End;
      default: {
        const exhaustive: never = point;
        throw new Error(`Unsupported semantic point: ${String(exhaustive)}`);
      }
    }
  }

  private getLocalSemanticPoint(size: IRectSize, point: RectSemanticPoint): THREE.Vector3 {
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    switch (point) {
      case RectSemantic.Top.Left: return new THREE.Vector3(-halfWidth, +halfHeight, 0);
      case RectSemantic.Top.Mid: return new THREE.Vector3(0, +halfHeight, 0);
      case RectSemantic.Top.Right: return new THREE.Vector3(+halfWidth, +halfHeight, 0);
      case RectSemantic.Right.Start: return new THREE.Vector3(+halfWidth, +halfHeight, 0);
      case RectSemantic.Right.Mid: return new THREE.Vector3(+halfWidth, 0, 0);
      case RectSemantic.Right.End: return new THREE.Vector3(+halfWidth, -halfHeight, 0);
      case RectSemantic.Bottom.Left: return new THREE.Vector3(-halfWidth, -halfHeight, 0);
      case RectSemantic.Bottom.Mid: return new THREE.Vector3(0, -halfHeight, 0);
      case RectSemantic.Bottom.Right: return new THREE.Vector3(+halfWidth, -halfHeight, 0);
      case RectSemantic.Left.Start: return new THREE.Vector3(-halfWidth, +halfHeight, 0);
      case RectSemantic.Left.Mid: return new THREE.Vector3(-halfWidth, 0, 0);
      case RectSemantic.Left.End: return new THREE.Vector3(-halfWidth, -halfHeight, 0);
      default: {
        const exhaustive: never = point;
        throw new Error(`Unsupported semantic point: ${String(exhaustive)}`);
      }
    }
  }

  private assertPositiveFinite(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be > 0.`);
    }
  }
}
