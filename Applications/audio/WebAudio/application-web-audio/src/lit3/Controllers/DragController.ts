// src/lit3/Controllers/DragController.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

import type {
  IDraggable,
  IHitTestable,
  IPositionable,
  Point,
} from "../WebComponents/IDraggable.js";

export class DragController implements ReactiveController {
  private active: IDraggable | null = null;
  private lastPoint: Point | null = null;

  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getCandidates: () => readonly Element[],
  ) {
    this.host.addController(this);
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

    this.lastPoint = point;
    this.host.requestUpdate();
  }

  public onPointerUp(): void {
    this.reset();
  }

  public onPointerLeave(): void {
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
