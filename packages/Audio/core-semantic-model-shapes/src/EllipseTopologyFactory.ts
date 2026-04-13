// packages/Audio/core-semantic-model-shapes/src/EllipseTopologyFactory.ts
import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import { IEllipseInput } from "./IEllipseInput.js";
import { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { ShapeTopology, ShapeVertex, VertexAddressKeys, ShapeEdge } from "./types.js";
import { IEdgePointFactory } from "./IEdgePointFactory.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import { ShapeVertexAddress } from "./ShapeVertexAddress.js";

export class EllipseTopologyFactory implements IShapeTopologyFactory<IEllipseInput> {
  public constructor(private readonly edgePointFactory: IEdgePointFactory) {}

  public create(input: IEllipseInput): ShapeTopology {
    this.validateInput(input);

    const cx = input.center.x;
    const cy = input.center.y;
    const rx = input.radiusX;
    const ry = input.radiusY;

    const vertices = Object.freeze<readonly ShapeVertex[]>([
      this.createVertex(`${input.id}:v:Center`, VertexAddressKeys.Center, cx, cy),
      this.createVertex(`${input.id}:v:LeftCenter`, VertexAddressKeys.LeftCenter, cx - rx, cy),
      this.createVertex(`${input.id}:v:TopCenter`, VertexAddressKeys.TopCenter, cx, cy - ry),
      this.createVertex(`${input.id}:v:RightCenter`, VertexAddressKeys.RightCenter, cx + rx, cy),
      this.createVertex(`${input.id}:v:BottomCenter`, VertexAddressKeys.BottomCenter, cx, cy + ry),
    ]);

    const [, leftCenter, topCenter, rightCenter, bottomCenter] = vertices;

    if (!leftCenter || !topCenter || !rightCenter || !bottomCenter) {
      throw new SemanticShapeValidationError(
        "Ellipse topology requires center and four boundary vertices."
      );
    }

    const edges = Object.freeze<readonly ShapeEdge[]>([
      this.createBoundaryEdge(`${input.id}:e:0`, leftCenter, topCenter),
      this.createBoundaryEdge(`${input.id}:e:1`, topCenter, rightCenter),
      this.createBoundaryEdge(`${input.id}:e:2`, rightCenter, bottomCenter),
      this.createBoundaryEdge(`${input.id}:e:3`, bottomCenter, leftCenter),
    ]);

    return Object.freeze({ vertices, edges });
  }

  private createBoundaryEdge(
    id: string,
    start: ShapeVertex,
    end: ShapeVertex
  ): ShapeEdge {
    return Object.freeze<ShapeEdge>({
      id,
      address: new ShapeEdgeAddress(EdgeAddressKeys.Boundary),
      startVertexId: start.id,
      endVertexId: end.id,
      points: this.edgePointFactory.createPoints(start.position, end.position),
    });
  }

  private createVertex(
    id: string,
    key: (typeof VertexAddressKeys)[keyof typeof VertexAddressKeys],
    x: number,
    y: number
  ): ShapeVertex {
    return Object.freeze({
      id,
      address: new ShapeVertexAddress(key),
      position: Object.freeze({ x, y }),
    });
  }

  private validateInput(input: IEllipseInput): void {
    if (input.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Ellipse id must not be empty.");
    }

    if (!Number.isFinite(input.center.x) || !Number.isFinite(input.center.y)) {
      throw new SemanticShapeValidationError("Ellipse center must be finite.");
    }

    if (!Number.isFinite(input.radiusX) || input.radiusX <= 0) {
      throw new SemanticShapeValidationError("Ellipse radiusX must be greater than zero.");
    }

    if (!Number.isFinite(input.radiusY) || input.radiusY <= 0) {
      throw new SemanticShapeValidationError("Ellipse radiusY must be greater than zero.");
    }
  }
}