import { CtxCirclePrimitiveRenderer } from "../Circle/CtxCirclePrimitiveRenderer";
import { CtxLinePrimitiveRenderer } from "./CtxLinePrimitiveRenderer";
 
import { VexLineRenderer } from "./VexLineRenderer";
import { VexLineShapeAdapter } from "./VexLineShapeAdapter";
import { VexVertexRenderer } from "../Renderers/VexVertexRenderer";
import { VexLine } from "./VexLine";

// ============================================================================
// COMPOSITION ROOT
// ============================================================================

export class VexLineShapeAdapterFactory {
  public create(line: VexLine): VexLineShapeAdapter {
    const circleRenderer = new CtxCirclePrimitiveRenderer();
    const lineRenderer = new CtxLinePrimitiveRenderer();
    const vertexRenderer = new VexVertexRenderer(circleRenderer);
    const vexLineRenderer = new VexLineRenderer(lineRenderer, vertexRenderer);

    return new VexLineShapeAdapter(line, vexLineRenderer);
  }
}
