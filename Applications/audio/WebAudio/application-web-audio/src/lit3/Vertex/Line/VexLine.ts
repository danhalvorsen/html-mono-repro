import { VexVertex } from "../VexVertex";

export class VexLine {
  public constructor(
    private readonly start: VexVertex,
    private readonly end: VexVertex,
    private readonly stroke: string = "#60a5fa",
    private readonly strokeWidth: number = 2
  ) { }

  public getStart(): VexVertex {
    return this.start;
  }

  public getEnd(): VexVertex {
    return this.end;
  }

  public getStroke(): string {
    return this.stroke;
  }

  public getStrokeWidth(): number {
    return this.strokeWidth;
  }
}
