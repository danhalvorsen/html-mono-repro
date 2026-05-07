export class BaseGameObjectShape {
  public constructor(
    public readonly width: number = 42,
    public readonly height: number = 28,
    public readonly fill: string = "#38bdf8",
    public readonly stroke: string = "#f8fafc",
    public readonly strokeWidth: number = 2,
  ) {}

  public get halfWidth(): number {
    return this.width / 2;
  }

  public get halfHeight(): number {
    return this.height / 2;
  }

  public get viewBox(): string {
    return `${-this.halfWidth} ${-this.halfHeight} ${this.width} ${this.height}`;
  }

  public get polygonPoints(): string {
    return `${-this.halfWidth},${this.halfHeight} ${this.halfWidth},0 ${-this.halfWidth},${-this.halfHeight}`;
  }
}
