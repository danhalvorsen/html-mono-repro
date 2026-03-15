// Applications/audio/WebAudio/application-web-audio/tests/Vextex/VexLineShapeFixture.ts

import { Vector2 } from "@monorepo/core-math";
 
import { CanvasContextSpy } from "../Spys/CanvasContextSpy.js";
import { ICanvasContext } from "../../../src/index.js";
import { VexLine } from "../../../src/lit3/Vertex/Line/VexLine.js";
import { VexLineShapeAdapter } from "../../../src/lit3/Vertex/Line/VexLineShapeAdapter.js";
import { VexLineShapeAdapterFactory } from "../../../src/lit3/Vertex/Line/VexLineShapeAdapterFactory.js";
import { VexVertex } from "../../../src/lit3/Vertex/VexVertex.js";

export type VexLineShapeFixtureOptions = Readonly<{
  start?: Vector2;
  end?: Vector2;
  startRadius?: number;
  endRadius?: number;
  startVisible?: boolean;
  endVisible?: boolean;
  startDraggable?: boolean;
  endDraggable?: boolean;
  stroke?: string;
  strokeWidth?: number;
}>;

export class VexLineShapeFixture {
  public readonly start: VexVertex;
  public readonly end: VexVertex;
  public readonly line: VexLine;
  public readonly adapter: VexLineShapeAdapter;
  public readonly canvas: HTMLCanvasElement;
  public readonly contextSpy: CanvasContextSpy;
  public readonly context: ICanvasContext;

  public constructor(options?: VexLineShapeFixtureOptions) {
    this.start = new VexVertex(
      options?.start ?? new Vector2(80, 80),
      options?.startRadius ?? 10,
      options?.startVisible ?? true,
      options?.startDraggable ?? true,
    );

    this.end = new VexVertex(
      options?.end ?? new Vector2(220, 160),
      options?.endRadius ?? 10,
      options?.endVisible ?? true,
      options?.endDraggable ?? true,
    );

    this.line = new VexLine(
      this.start,
      this.end,
      options?.stroke ?? "#60a5fa",
      options?.strokeWidth ?? 2,
    );

    this.adapter = new VexLineShapeAdapterFactory().create(this.line);
    this.canvas = document.createElement("canvas");
    this.contextSpy = new CanvasContextSpy();

    this.context = {
      canvas: this.canvas,
      ctx: this.contextSpy.context,
    };
  }

  public draw(): void {
    this.adapter.draw(this.context);
  }

  public hitTest(point: Vector2): boolean {
    return this.adapter.pointInsideShape(point, "edge");
  }
}