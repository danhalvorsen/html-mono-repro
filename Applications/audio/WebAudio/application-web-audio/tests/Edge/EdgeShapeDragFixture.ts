// Fix 4: tests/fixtures/EdgeShapeDragFixture.ts
// Class fixture stays a class. Tests must instantiate it with new.

import { Point, Vector2 } from "@monorepo/core-math";

import { type EdgeShape, MrDraggable } from "../../src/index.js";
import { DragTestFixtureBase } from "../Fixtures/DragTestFixtureBase.js";

type DebugLogger = (message: string, data?: unknown) => void;

export type EdgeShapeDragSnapshot = Readonly<{
  p0: Vector2;
  p1: Vector2;
  position: Vector2;
  width: number;
  height: number;
  requestUpdateCalls: number;
}>;

export class EdgeShapeDragFixture extends DragTestFixtureBase {
  public readonly draggable: MrDraggable;
  public readonly edge: EdgeShape;

  private readonly debugEnabled: boolean;
  private readonly logger: DebugLogger;

  public constructor(
    options?: Readonly<{
      p0?: Vector2;
      p1?: Vector2;
      debug?: boolean;
      logger?: DebugLogger;
    }>,
  ) {
    super();

    this.logger = options?.logger ?? this.defaultLogger;
    this.debugEnabled = options?.debug ?? false;

    this.draggable = document.createElement("mr-draggable") as MrDraggable;
    this.edge = document.createElement("mr-edge-shape") as EdgeShape;

    this.edge.p0 = options?.p0 ?? new Vector2(80, 80);
    this.edge.p1 = options?.p1 ?? new Vector2(220, 160);

    this.draggable.append(this.edge);
    this.root.append(this.draggable);
  }

  public async initialize(): Promise<this> {
    await this.draggable.updateComplete;
    await this.edge.updateComplete;
    await this.flush();

    this.debug("fixture created", this.snapshot());
    return this;
  }

  public override pointerDown(point: Point): void {
    this.debug("pointerDown before", { point, snapshot: this.snapshot() });
    super.pointerDown(point);
    this.debug("pointerDown after", { point, snapshot: this.snapshot() });
  }

  public override pointerMove(point: Point): void {
    this.debug("pointerMove before", { point, snapshot: this.snapshot() });
    super.pointerMove(point);
    this.debug("pointerMove after", { point, snapshot: this.snapshot() });
  }

  public override pointerUp(): void {
    this.debug("pointerUp before", this.snapshot());
    super.pointerUp();
    this.debug("pointerUp after", this.snapshot());
  }

  public getLength(): number {
    return Math.hypot(
      this.edge.p1.x - this.edge.p0.x,
      this.edge.p1.y - this.edge.p0.y,
    );
  }

  public snapshot(): EdgeShapeDragSnapshot {
    return {
      p0: new Vector2(this.edge.p0.x, this.edge.p0.y),
      p1: new Vector2(this.edge.p1.x, this.edge.p1.y),
      position: this.edge.getPosition(),
      width: this.edge.getWidth(),
      height: this.edge.getHeight(),
      requestUpdateCalls: this.host.requestUpdateCalls,
    };
  }

  private debug(message: string, data?: unknown): void {
    if (!this.debugEnabled) {
      return;
    }

    this.logger(`[EdgeShapeDragFixture] ${message}`, data);
  }

  private defaultLogger(message: string, data?: unknown): void {
    if (data === undefined) {
      console.debug(message);
      return;
    }

    console.debug(message, data);
  }
}