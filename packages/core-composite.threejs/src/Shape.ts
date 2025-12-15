// ============================================================================
// Shape abstraction (backend-agnostic render primitive)
// ============================================================================

import { Vector3, Line } from "three/src/Three.js";
import { BaseReactiveElement } from "./BaseReactiveElement.js";
import { IShape } from "./IShape.js";

export abstract class Shape extends BaseReactiveElement implements IShape {
    createShape(): Shape {
        throw new Error("Method not implemented.");
    }
    updateShape(o: Shape): void {
        throw new Error("Method not implemented.");
    }
    getConnectionPoints?(): Array<Vector3> {
        throw new Error("Method not implemented.");
    }
    getEdges?(): Array<Line> {
        throw new Error("Method not implemented.");
    }
    getEdgeConnectionsPoint(edge: Line): Array<Vector3> {
        throw new Error("Method not implemented.");
    }
}
