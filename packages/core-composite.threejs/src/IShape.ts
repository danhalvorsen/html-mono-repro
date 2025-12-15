import { Line, Vector3 } from "three/src/Three.js";
import { Shape } from "./Shape.js";

// ============================================================================
// Pure shape interface (backend-agnostic)
// ============================================================================

export interface IShape {
    createShape(): Shape; // Build once
    updateShape(o: Shape): void; // Mutate or animate per frame
    getConnectionPoints?(): Array<Vector3>; 
    getEdges?(): Array<Line>; 
    getEdgeConnectionsPoint(edge: Line): Array<Vector3>; 
    
}
