// src/lit3/Controllers/DragController.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

import { IDragController } from "./IDragController.js";
import { Point, Vector2 } from "@monorepo/core-math";
import { IDraggable } from "../index.js";
import { DragOperation } from "./DragOperation.js";
import type { IDraggableIdentity } from "./IDraggableIdentity.js";
import type { IDragPipeline } from "../Pipeline/Contracts/IDragPipeline.js";
import { DefaultDraggableIdentity } from "../Pipeline/Contracts/DefaultDraggableIdentity.js";
import { OnDragMessage } from "../Pipeline/Messages/OnDragMessage.js";
import { IHitTestable, IPositionable } from "../lit3/WebComponents/IDraggable.js";

export class DragController implements ReactiveController, IDragController {
  private active: IDraggable | null = null;
  private lastPoint: Point | null = null;
  private pendingPipelineWork: Promise<void> = Promise.resolve();

  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getCandidates: () => readonly Element[],
    private readonly dragPipeline?: IDragPipeline,
    private readonly draggableIdentity: IDraggableIdentity = new DefaultDraggableIdentity(),
  ) {
    this.host.addController(this);
  }
  async onDragStart(target: IDraggable, position: Vector2): Promise<void> {
    await this.sendDragMessage(DragOperation.Start, target, position);
  }
  async onDrag(target: IDraggable, position: Vector2): Promise<void> {
    await this.sendDragMessage(DragOperation.Move, target, position);
  }
  async onDragOver(target: IDraggable, position: Vector2): Promise<void> {
    await this.sendDragMessage(DragOperation.Over, target, position);
  }
  async onDrop(target: IDraggable, position: Vector2): Promise<void> {
    await this.sendDragMessage(DragOperation.Drop, target, position);
  }
  async onCancel(target: IDraggable): Promise<void> {
    const position = target.getPosition();

    await this.sendDragMessage(
      DragOperation.Cancel,
      target,
      new Vector2(position.x, position.y),
    );
  }
  hostUpdate?(): void {
 
  }
  hostUpdated?(): void {
  
   }

  public hostConnected(): void {
    // no-op
  }

  public hostDisconnected(): void {
    this.reset();
  }

  public onPointerDown(point: Point): void {
    const target = this.hitTest(point);

    if (target === null) {
      this.reset();
      return;
    }

    this.active = target;
    this.lastPoint = point;
    this.enqueuePipelineWork(() =>
      this.onDragStart(target, new Vector2(point.x, point.y)),
    );
  }

  public onPointerMove(point: Point): void {
    if (this.active === null || this.lastPoint === null) {
      return;
    }

    const dx = point.x - this.lastPoint.x;
    const dy = point.y - this.lastPoint.y;

    if (dx === 0 && dy === 0) {
      return;
    }

    const current = this.active.getPosition();

    this.active.setPosition({
      x: current.x + dx,
      y: current.y + dy,
    });

    const active = this.active;
    this.lastPoint = point;
    this.host.requestUpdate();
    this.enqueuePipelineWork(() =>
      this.onDrag(active, new Vector2(point.x, point.y)),
    );
  }

  public onPointerUp(): void {
    if (this.active !== null && this.lastPoint !== null) {
      const active = this.active;
      const lastPoint = this.lastPoint;

      this.enqueuePipelineWork(() =>
        this.onDrop(
          active,
          new Vector2(lastPoint.x, lastPoint.y),
        ),
      );
    }

    this.reset();
  }

  public onPointerLeave(): void {
    if (this.active !== null) {
      const active = this.active;
      this.enqueuePipelineWork(() => this.onCancel(active));
    }

    this.reset();
  }

  public hitTest(point: Point): IDraggable | null {
    const draggables = this.resolveDraggables();

    for (let index = draggables.length - 1; index >= 0; index--) {
      const draggable = draggables[index];

      if (draggable !== undefined && draggable.containsPoint(point)) {
        return draggable;
      }
    }

    return null;
  }

  private reset(): void {
    this.active = null;
    this.lastPoint = null;
  }

  private async sendDragMessage(
    operation: DragOperation,
    target: IDraggable,
    position: Vector2,
  ): Promise<void> {
    if (this.dragPipeline === undefined) {
      return;
    }

    await this.dragPipeline.send(
      new OnDragMessage({
        operation,
        targetId: this.draggableIdentity.getId(target),
        target,
        x: position.x,
        y: position.y,
      }),
    );
  }

  private enqueuePipelineWork(work: () => Promise<void>): void {
    this.pendingPipelineWork = this.pendingPipelineWork.then(work, work);
  }

  private resolveDraggables(): readonly IDraggable[] {
    const result: IDraggable[] = [];

    for (const candidate of this.getCandidates()) {
      this.collectDraggables(candidate, result);
    }

    return result;
  }

  private collectDraggables(element: Element, result: IDraggable[]): void {
    if (this.isDraggable(element)) {
      result.push(element);
    }

    for (const child of Array.from(element.children)) {
      this.collectDraggables(child, result);
    }

    const shadowRoot = (element as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;

    if (shadowRoot === null || shadowRoot === undefined) {
      return;
    }

    for (const child of Array.from(shadowRoot.children)) {
      this.collectDraggables(child, result);
    }
  }

  private isDraggable(value: unknown): value is IDraggable {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Partial<IHitTestable & IPositionable> &
      Record<string, unknown>;

    return (
      typeof candidate.getPosition === "function" &&
      typeof candidate.setPosition === "function" &&
      typeof candidate.containsPoint === "function" &&
      "shape" in candidate
    );
  }
}
