import { ILinePrimitiveRenderer } from "./ILinePrimitiveRenderer";
import { IVexLineRenderer } from "./IVLineRenderer";
import { IVVertexRenderer } from "../IVVertexRenderer";
import { VexLine } from "./VexLine";
 
export class VexLineRenderer implements IVexLineRenderer {
  public constructor(
    private readonly lineRenderer: ILinePrimitiveRenderer,
    private readonly vertexRenderer: IVVertexRenderer
  ) { }

  public render(ctx: CanvasRenderingContext2D, line: VexLine): void {
    const start = line.getStart().getPosition();
    const end = line.getEnd().getPosition();

    ctx.save();

    this.lineRenderer.render(ctx, start, end, {
      stroke: line.getStroke(),
      strokeWidth: line.getStrokeWidth(),
    });

    this.vertexRenderer.render(ctx, line.getStart());
    this.vertexRenderer.render(ctx, line.getEnd());

    ctx.restore();
  }
}
