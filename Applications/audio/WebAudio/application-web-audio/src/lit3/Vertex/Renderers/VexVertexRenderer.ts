 
import { IFillStrokeStyle } from "../Style/IFillStrokeStyle";
import { IVVertexRenderer } from "../IVVertexRenderer";
import { VexVertex } from "../VexVertex";
import { ICirclePrimitiveRenderer } from "../Circle/ICirclePrimitiveRenderer";

// ============================================================================
// VEX RENDERERS
// ============================================================================

export class VexVertexRenderer implements IVVertexRenderer {
  private static readonly defaultStyle: IFillStrokeStyle = {
    fill: "#ffffff",
    stroke: "#1f2937",
    strokeWidth: 1,
  };

  public constructor(
    private readonly circleRenderer: ICirclePrimitiveRenderer,
    private readonly style: IFillStrokeStyle = VexVertexRenderer.defaultStyle
  ) { }

  public render(ctx: CanvasRenderingContext2D, vertex: VexVertex): void {
    if (!vertex.isVisible()) {
      return;
    }

    this.circleRenderer.render(
      ctx,
      vertex.getPosition(),
      vertex.getRadius(),
      this.style
    );
  }
}
