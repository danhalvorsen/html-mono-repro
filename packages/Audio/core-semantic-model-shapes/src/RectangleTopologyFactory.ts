import type {
  SemanticEdgeId,
  SemanticVertexId,
} from "@monorepo/core-semantic-model";

import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import type { IEdgePointFactory } from "./IEdgePointFactory.js";
import type { IRectangleInput } from "./IRectangleInput.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import { ShapeVertexAddress } from "./ShapeVertexAddress.js";
import type {
  ShapeEdge,
  ShapeTopology,
  ShapeVertex,
  VertexAddressKey,
} from "./types.js";
import { VertexAddressKeys } from "./types.js";

export class RectangleTopologyFactory
  implements IShapeTopologyFactory<IRectangleInput>
{
  public constructor(private readonly edgePointFactory: IEdgePointFactory) {}

  public create(input: IRectangleInput): ShapeTopology {
    this.validateInput(input);

    const left = input.x;
    const top = input.y;
    const right = input.x + input.width;
    const bottom = input.y + input.height;

    const vertices = Object.freeze<readonly ShapeVertex[]>([
      this.createVertex(
        `${input.id}:v:LeftTop`,
        VertexAddressKeys.LeftTop,
        left,
        top,
      ),
      this.createVertex(
        `${input.id}:v:RightTop`,
        VertexAddressKeys.RightTop,
        right,
        top,
      ),
      this.createVertex(
        `${input.id}:v:RightBottom`,
        VertexAddressKeys.RightBottom,
        right,
        bottom,
      ),
      this.createVertex(
        `${input.id}:v:LeftBottom`,
        VertexAddressKeys.LeftBottom,
        left,
        bottom,
      ),
    ]);

    const [leftTop, rightTop, rightBottom, leftBottom] = vertices;

    if (!leftTop || !rightTop || !rightBottom || !leftBottom) {
      throw new SemanticShapeValidationError(
        "Rectangle topology requires exactly 4 vertices.",
      );
    }

    const edges = Object.freeze<readonly ShapeEdge[]>([
      this.createEdge(
        `${input.id}:e:Top`,
        EdgeAddressKeys.Top,
        leftTop,
        rightTop,
      ),
      this.createEdge(
        `${input.id}:e:Right`,
        EdgeAddressKeys.Right,
        rightTop,
        rightBottom,
      ),
      this.createEdge(
        `${input.id}:e:Bottom`,
        EdgeAddressKeys.Bottom,
        rightBottom,
        leftBottom,
      ),
      this.createEdge(
        `${input.id}:e:Left`,
        EdgeAddressKeys.Left,
        leftBottom,
        leftTop,
      ),
    ]);

    return Object.freeze({ vertices, edges });
  }

  private createVertex(
    id: SemanticVertexId,
    addressKey: VertexAddressKey,
    x: number,
    y: number,
  ): ShapeVertex {
    return Object.freeze<ShapeVertex>({
      id,
      address: new ShapeVertexAddress(addressKey),
      position: Object.freeze({ x, y }),
    });
  }

  private createEdge(
    id: SemanticEdgeId,
    addressKey: (typeof EdgeAddressKeys)[keyof typeof EdgeAddressKeys],
    start: ShapeVertex,
    end: ShapeVertex,
  ): ShapeEdge {
    return Object.freeze<ShapeEdge>({
      id,
      address: new ShapeEdgeAddress(addressKey),
      startVertexId: start.id,
      endVertexId: end.id,
      points: this.edgePointFactory.createPoints(start.position, end.position),
    });
  }

  private validateInput(input: IRectangleInput): void {
    if (input.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Rectangle id must not be empty.");
    }

    if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
      throw new SemanticShapeValidationError(
        "Rectangle origin must be finite.",
      );
    }

    if (!Number.isFinite(input.width) || input.width <= 0) {
      throw new SemanticShapeValidationError(
        "Rectangle width must be greater than zero.",
      );
    }

    if (!Number.isFinite(input.height) || input.height <= 0) {
      throw new SemanticShapeValidationError(
        "Rectangle height must be greater than zero.",
      );
    }
  }
}
