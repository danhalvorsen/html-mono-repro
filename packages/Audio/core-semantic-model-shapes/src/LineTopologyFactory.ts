import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import { ILineInput } from "./ILineInput.js";
import { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { ShapeTopology, ShapeVertex, VertexAddressKeys, ShapeEdge } from "./types.js";
import { IEdgePointFactory } from "./IEdgePointFactory.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import { ShapeVertexAddress } from "./ShapeVertexAddress.js";

export class LineTopologyFactory implements IShapeTopologyFactory<ILineInput> {
  public constructor(private readonly edgePointFactory: IEdgePointFactory) { }

  public create(input: ILineInput): ShapeTopology {
    this.validateInput(input);

    const start = Object.freeze<ShapeVertex>({
      id: `${input.id}:v:Start`,
      address: new ShapeVertexAddress(VertexAddressKeys.LeftCenter),
      position: Object.freeze({ x: input.start.x, y: input.start.y }),
    });

    const end = Object.freeze<ShapeVertex>({
      id: `${input.id}:v:End`,
      address: new ShapeVertexAddress(VertexAddressKeys.RightCenter),
      position: Object.freeze({ x: input.end.x, y: input.end.y }),
    });

    const edge = Object.freeze<ShapeEdge>({
      id: `${input.id}:e:Boundary`,
      address: new ShapeEdgeAddress(EdgeAddressKeys.Boundary),
      startVertexId: start.id,
      endVertexId: end.id,
      points: this.edgePointFactory.createPoints(start.position, end.position),
    });

    return Object.freeze({
      vertices: Object.freeze([start, end]),
      edges: Object.freeze([edge]),
    });
  }

  private validateInput(input: ILineInput): void {
    if (input.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Line id must not be empty.");
    }

    for (const point of [input.start, input.end]) {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new SemanticShapeValidationError("Line points must be finite.");
      }
    }
  }
}

