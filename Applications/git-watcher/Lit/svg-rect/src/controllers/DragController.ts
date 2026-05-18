// Applications/Lit/svg-rect/src/controllers/SvgRectDragController.ts
import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { MouseDragMove } from "./MouseController.js";
import type { RectModel } from "./types.js";
 
type Host = ReactiveControllerHost & EventTarget;

export class DragController implements ReactiveController {
  private dragging = false;
  private r0 = { x: 0, y: 0, w: 0, h: 0 };

  private readonly onStart = (_e: Event) => this.start();
  private readonly onMove = (e: Event) => this.move(e as CustomEvent<MouseDragMove>);
  private readonly onEnd = (_e: Event) => this.end();

  public constructor(private readonly host: Host, private readonly rect: RectModel) {
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("mouse:start", this.onStart);
    this.host.addEventListener("mouse:move", this.onMove);
    this.host.addEventListener("mouse:end", this.onEnd);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("mouse:start", this.onStart);
    this.host.removeEventListener("mouse:move", this.onMove);
    this.host.removeEventListener("mouse:end", this.onEnd);
  }

  public beginDrag(): void {
    this.dragging = true;
  }

  private start(): void {
    if (!this.dragging) return;
    this.r0 = { x: this.rect.x, y: this.rect.y, w: this.rect.w, h: this.rect.h };
  }

  private move(e: CustomEvent<MouseDragMove>): void {
    if (!this.dragging) return;
    const { dx, dy } = e.detail;

    this.rect.x = this.r0.x + dx;
    this.rect.y = this.r0.y + dy;

    this.host.requestUpdate();
  }

  private end(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.host.requestUpdate();
  }
}