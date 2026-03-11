import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { IDraggable, Point } from "../WebComponents/IDraggable.js";

export class DragController implements ReactiveController {
  private active: IDraggable | null = null;
  private lastPoint: Point | null = null;

  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getDraggables: () => readonly IDraggable[],
    private readonly toLocalPoint: (event: MouseEvent) => Point,
  ) {
    this.host.addController(this);
  }

  public hostDisconnected(): void {
    this.active = null;
    this.lastPoint = null;
  }

  public onMouseDown(event: MouseEvent): void {
    const point = this.toLocalPoint(event);

    for (const draggable of [...this.getDraggables()].reverse()) {
      if (draggable.containsPoint(point)) {
        this.active = draggable;
        this.lastPoint = {
          x: event.clientX,
          y: event.clientY,
        };
        return;
      }
    }

    this.active = null;
    this.lastPoint = null;
  }

  public onMouseMove(event: MouseEvent): void {
    if (this.active === null || this.lastPoint === null) {
      return;
    }

    const dx = event.clientX - this.lastPoint.x;
    const dy = event.clientY - this.lastPoint.y;

    if (dx === 0 && dy === 0) {
      return;
    }

    const position = this.active.getPosition();

    this.active.setPosition({
      x: position.x + dx,
      y: position.y + dy,
    });

    this.lastPoint = {
      x: event.clientX,
      y: event.clientY,
    };

    this.host.requestUpdate();
  }

  public onMouseUp(): void {
    this.active = null;
    this.lastPoint = null;
  }
}