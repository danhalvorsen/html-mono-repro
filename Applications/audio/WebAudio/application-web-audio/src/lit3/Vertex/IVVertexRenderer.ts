import { VexVertex } from "./VexVertex";

export interface IVVertexRenderer {
  render(ctx: CanvasRenderingContext2D, vertex: VexVertex): void;
}
