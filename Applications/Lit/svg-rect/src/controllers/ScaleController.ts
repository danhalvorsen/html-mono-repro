// Applications/Lit/svg-rect/src/controllers/SvgRectScaleController.ts
import type { ReactiveController } from "lit";
import type { MouseDragMove } from "./MouseController.js";
 import type { Handle, RectModel } from "./types.js"
import type { Host } from "./types.js";

export class ScaleController implements ReactiveController {
  private scaling = false;
  private handle: Handle = "se";
  private r0 = { x: 0, y: 0, w: 0, h: 0 };

  private readonly onStart = (_e: Event) => this.start();
  private readonly onMove = (e: Event) => this.move(e as CustomEvent<MouseDragMove>);
  private readonly onEnd = (_e: Event) => this.end();

  public constructor(
    private readonly host: Host,
    private readonly rect: RectModel,
    private readonly minSize = 8
  ) {
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

  /** called by host template on handle pointerdown */
  public beginScale(h: Handle): void {
    this.scaling = true;
    this.handle = h;
  }

  private start(): void {
    if (!this.scaling) return;
    this.r0 = { x: this.rect.x, y: this.rect.y, w: this.rect.w, h: this.rect.h };
  }

  private move(e: CustomEvent<MouseDragMove>): void {
    if (!this.scaling) return;

    const { dx, dy } = e.detail;

    let x = this.r0.x, y = this.r0.y, w = this.r0.w, h = this.r0.h;
    const ox2 = this.r0.x + this.r0.w;
    const oy2 = this.r0.y + this.r0.h;

    switch (this.handle) {
      case "nw": x = this.r0.x + dx; y = this.r0.y + dy; w = this.r0.w - dx; h = this.r0.h - dy; break;
      case "ne": y = this.r0.y + dy; w = this.r0.w + dx; h = this.r0.h - dy; break;
      case "se": w = this.r0.w + dx; h = this.r0.h + dy; break;
      case "sw": x = this.r0.x + dx; w = this.r0.w - dx; h = this.r0.h + dy; break;
    }

    w = Math.max(this.minSize, w);
    h = Math.max(this.minSize, h);

    if (this.handle === "nw") { x = ox2 - w; y = oy2 - h; }
    if (this.handle === "ne") { x = this.r0.x; y = oy2 - h; }
    if (this.handle === "se") { x = this.r0.x; y = this.r0.y; }
    if (this.handle === "sw") { x = ox2 - w; y = this.r0.y; }

    this.rect.x = x;
    this.rect.y = y;
    this.rect.w = w;
    this.rect.h = h;

    this.host.requestUpdate();
  }

  private end(): void {
    if (!this.scaling) return;
    this.scaling = false;
    this.host.requestUpdate();
  }
}