// Applications/audio/WebAudio/application-web-audio/tests/Vextex/CanvasContextSpy.ts

export type CanvasCallLog = Readonly<{
  beginPath: number;
  moveTo: ReadonlyArray<readonly [number, number]>;
  lineTo: ReadonlyArray<readonly [number, number]>;
  arc: ReadonlyArray<readonly [number, number, number, number, number]>;
  fill: number;
  stroke: number;
  save: number;
  restore: number;
}>;

type MutableCanvasCallLog = {
  beginPath: number;
  moveTo: Array<[number, number]>;
  lineTo: Array<[number, number]>;
  arc: Array<[number, number, number, number, number]>;
  fill: number;
  stroke: number;
  save: number;
  restore: number;
};

export class CanvasContextSpy {
  private readonly calls: MutableCanvasCallLog = {
    beginPath: 0,
    moveTo: [],
    lineTo: [],
    arc: [],
    fill: 0,
    stroke: 0,
    save: 0,
    restore: 0,
  };

  private readonly context2d: CanvasRenderingContext2D;

  public constructor() {
    this.context2d = {
      beginPath: (): void => {
        this.calls.beginPath++;
      },
      moveTo: (x: number, y: number): void => {
        this.calls.moveTo.push([x, y]);
      },
      lineTo: (x: number, y: number): void => {
        this.calls.lineTo.push([x, y]);
      },
      arc: (
        x: number,
        y: number,
        radius: number,
        startAngle: number,
        endAngle: number,
      ): void => {
        this.calls.arc.push([x, y, radius, startAngle, endAngle]);
      },
      fill: (): void => {
        this.calls.fill++;
      },
      stroke: (): void => {
        this.calls.stroke++;
      },
      save: (): void => {
        this.calls.save++;
      },
      restore: (): void => {
        this.calls.restore++;
      },
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;
  }

  public get context(): CanvasRenderingContext2D {
    return this.context2d;
  }

  public get log(): CanvasCallLog {
    return {
      beginPath: this.calls.beginPath,
      moveTo: [...this.calls.moveTo],
      lineTo: [...this.calls.lineTo],
      arc: [...this.calls.arc],
      fill: this.calls.fill,
      stroke: this.calls.stroke,
      save: this.calls.save,
      restore: this.calls.restore,
    };
  }
}