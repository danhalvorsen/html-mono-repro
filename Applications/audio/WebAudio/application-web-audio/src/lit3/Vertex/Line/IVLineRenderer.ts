import { VexLine } from "./VexLine";

export interface IVexLineRenderer {
  render(ctx: CanvasRenderingContext2D, line: VexLine): void;
}
