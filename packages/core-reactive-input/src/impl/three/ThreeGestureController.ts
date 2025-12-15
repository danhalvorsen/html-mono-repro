import { IGestureController, IGestureEvent, GestureType } from "../../abstractions/IGestureController.js";
import { ThreeTouchController } from "./ThreeTouchController.js";
import * as THREE from "three";

/**
 * High-level gesture interpreter for Three.js scenes.
 * Converts touch input into gestures (pinch, swipe, tap) with 3D intersections.
 */
export class ThreeGestureController implements IGestureController {
  private readonly touch: ThreeTouchController;
  private readonly handlers = new Map<GestureType, Set<(e: IGestureEvent) => void>>();
  private startTouches: Array<{ id: number; x: number; y: number }> | null = null;
  private startTime = 0;
  private active = false;

  constructor(touch: ThreeTouchController) {
    this.touch = touch;
    this.touch.on("touchstart", e => this.onStart(e));
    this.touch.on("touchmove", e => this.onMove(e));
    this.touch.on("touchend", e => this.onEnd(e));
  }

  enable(): void {
    this.touch.enable();
  }

  disable(): void {
    this.touch.disable();
  }

  on(type: GestureType, handler: (e: IGestureEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: GestureType, handler: (e: IGestureEvent) => void): void {
    this.handlers.get(type)?.delete(handler);
  }

  destroy(): void {
    this.handlers.clear();
  }

  private emit(type: GestureType, event: IGestureEvent): void {
    this.handlers.get(type)?.forEach(h => h(event));
  }

  // ---------------------------------------------------

  private onStart(e: any): void {
    this.startTouches = e.touches;
    this.startTime = Date.now();
    this.active = true;
  }

  private onMove(e: any): void {
    if (!this.active || !this.startTouches) return;
    if (e.touches.length === 2 && this.startTouches.length === 2) {
      const scale = this.distance(e.touches) / this.distance(this.startTouches);
      const angle = this.angle(e.touches) - this.angle(this.startTouches);
      this.emit("pinch", {
        type: "pinch",
        gesture: "pinch",
        scale,
        angle,
        x: (e.touches[0].x + e.touches[1].x) / 2,
        y: (e.touches[0].y + e.touches[1].y) / 2,
        originalEvent: e.originalEvent,
        target: e.touches[0].target,
      });
      this.startTouches = e.touches;
    }
  }

  private onEnd(e: any): void {
    const elapsed = Date.now() - this.startTime;
    if (!this.startTouches) return;
    const first = this.startTouches[0];
    const last = e.touches[0];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10 && elapsed < 250) {
      this.emit("tap", {
        type: "tap",
        gesture: "tap",
        x: last.x,
        y: last.y,
        originalEvent: e.originalEvent,
        target: last.target,
      });
    } else if (dist > 30 && elapsed < 500) {
      const dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "swipe-right"
            : "swipe-left"
          : dy > 0
            ? "swipe-down"
            : "swipe-up";
      this.emit("swipe", {
        type: "swipe",
        gesture: dir,
        x: last.x,
        y: last.y,
        originalEvent: e.originalEvent,
        target: last.target,
      });
    }
    this.startTouches = null;
    this.active = false;
  }

  private distance(list: Array<{ x: number; y: number }>): number {
    const [t1, t2] = list;
    return Math.hypot(t2.x - t1.x, t2.y - t1.y);
  }

  private angle(list: Array<{ x: number; y: number }>): number {
    const [t1, t2] = list;
    return Math.atan2(t2.y - t1.y, t2.x - t1.x);
  }
}
