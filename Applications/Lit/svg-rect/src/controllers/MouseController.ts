// src/controllers/MouseReactiveController.ts
import type { ReactiveController } from "lit";
import { Point2 } from "../math/Point2.js";
import type { SvgCanvas } from "../svgs/SvgCanvas.js";

export type MouseStart = { point: Point2; pointerId: number };
export type MouseDragMove = { point: Point2; dx: number; dy: number; pointerId: number };
export type MouseEnd = { point: Point2; pointerId: number };

type Host = {
  addController(c: ReactiveController): void;
  dispatchEvent(e: Event): boolean;
};

export class MouseController implements ReactiveController {
  private readonly host: Host;
  private canvas?: SvgCanvas;

  private pid: number | null = null;
  private start: Point2 = new Point2(0, 0);

  private readonly move = (e: PointerEvent) => this.onMove(e);
  private readonly up = (e: PointerEvent) => this.onUp(e);
  private readonly cancel = (e: PointerEvent) => this.onCancel(e);

  public constructor(host: Host) {
    this.host = host;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.detach();
  }

  attach(canvas: SvgCanvas): void {
    if (this.canvas === canvas) return;
    this.detach();
    this.canvas = canvas;
    // do NOT attach move/up here; only on begin()
  }

  detach(): void {
    this.stopSession();
    this.canvas = undefined;
  }

  begin(e: PointerEvent): void {
    if (!this.canvas) return;
    if (this.pid !== null) return; // already active

    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();

    this.pid = e.pointerId;
    const start = this.canvas.toSvgPoint(e);
    this.start = new Point2(start.x, start.y);

    try { this.canvas.el.setPointerCapture(this.pid); } catch {}

    window.addEventListener("pointermove", this.move, { passive: false });
    window.addEventListener("pointerup", this.up, { passive: true });
    window.addEventListener("pointercancel", this.cancel, { passive: true });

    this.host.dispatchEvent(new CustomEvent<MouseStart>("mouse:start", {
      bubbles: false,
      composed: false,
      detail: { point: this.start, pointerId: this.pid },
    }));
  }

  private onMove(e: PointerEvent): void {
    if (!this.canvas || this.pid === null || e.pointerId !== this.pid) return;

    e.preventDefault();
    const point = this.canvas.toSvgPoint(e);
    const p = new Point2(point.x, point.y);

    this.host.dispatchEvent(new CustomEvent<MouseDragMove>("mouse:move", {
      bubbles: false,
      composed: false,
      detail: {
        point: p,
        dx: p.x - this.start.x,
        dy: p.y - this.start.y,
        pointerId: this.pid,
      },
    }));
  }

  private onUp(e: PointerEvent): void {
    if (!this.canvas || this.pid === null || e.pointerId !== this.pid) return;

    const point = this.canvas.toSvgPoint(e);
    const p = new Point2(point.x, point.y);

    try { this.canvas.el.releasePointerCapture(this.pid); } catch {}

    const pid = this.pid;
    this.stopSession();

    this.host.dispatchEvent(new CustomEvent<MouseEnd>("mouse:end", {
      bubbles: false,
      composed: false,
      detail: { point: p, pointerId: pid },
    }));
  }

  private onCancel(e: PointerEvent): void {
    // treat cancel like end, but keep semantic if you want a separate event
    this.onUp(e);
  }

  private stopSession(): void {
    window.removeEventListener("pointermove", this.move);
    window.removeEventListener("pointerup", this.up);
    window.removeEventListener("pointercancel", this.cancel);
    this.pid = null;
  }
}