import { IGestureController, IGestureEvent, GestureType } from "../../abstractions/IGestureController.js";
import { DomTouchController } from "./DomTouchController.js";
import { ITouchEvent } from "../../abstractions/ITouchController.js";

/**
 * High-level gesture interpreter for DOM touch input.
 * Delegates low-level touch listening to the singleton DomTouchController.
 */
export class DomGestureController implements IGestureController {
  private readonly touch = DomTouchController.instance;
  private readonly handlers = new Map<GestureType, Set<(e: IGestureEvent) => void>>();

  private startTime = 0;
  private startTouches: ITouchEvent["touches"] | null = null;

  private active = false;

  constructor() {
    // Subscribe to shared touch events once
    this.touch.on("touchstart", e => this.onTouchStart(e));
    this.touch.on("touchmove", e => this.onTouchMove(e));
    this.touch.on("touchend", e => this.onTouchEnd(e));
    this.touch.enable(); // ensure the global touch controller is active
  }
    enable(): void {
        throw new Error("Method not implemented.");
    }
    disable(): void {
        throw new Error("Method not implemented.");
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
    // Do NOT disable the global touch controller here – it’s shared.
  }

  private emit(type: GestureType, event: IGestureEvent): void {
    this.handlers.get(type)?.forEach(h => h(event));
  }

  // -------------------------------------------------------
  // Touch interpretation logic
  // -------------------------------------------------------

  private onTouchStart(e: ITouchEvent): void {
    this.active = true;
    this.startTime = Date.now();
    this.startTouches = e.touches.map(t => ({ ...t }));
  }

  private onTouchMove(e: ITouchEvent): void {
    if (!this.active || !this.startTouches) return;
    if (e.touches.length === 2 && this.startTouches.length === 2) {
      // Two-finger pinch/rotate
      const scale = this.distance(e.touches) / this.distance(this.startTouches);
      const rotation = this.angle(e.touches) - this.angle(this.startTouches);

      this.emit("pinch", {
        type: "pinch",
        gesture: "pinch",
        scale,
        angle: rotation,
        x: (e.touches[0].x + e.touches[1].x) / 2,
        y: (e.touches[0].y + e.touches[1].y) / 2,
        originalEvent: e.originalEvent,
      });

      // update start snapshot for continuous movement
      this.startTouches = e.touches.map(t => ({ ...t }));
    }
  }

  private onTouchEnd(e: ITouchEvent): void {
    if (!this.startTouches) return;
    const elapsed = Date.now() - this.startTime;
    const first = this.startTouches[0];
    const last = e.changedTouches?.[0];
    if (!first || !last) {
      this.reset();
      return;
    }

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
        gesture: dir as any,
        x: last.x,
        y: last.y,
        originalEvent: e.originalEvent,
      });
    }

    this.reset();
  }

  private reset(): void {
    this.active = false;
    this.startTouches = null;
  }

  private distance(list: ITouchEvent["touches"]): number {
    const [t1, t2] = list;
    const dx = t2.x - t1.x;
    const dy = t2.y - t1.y;
    return Math.hypot(dx, dy);
  }

  private angle(list: ITouchEvent["touches"]): number {
    const [t1, t2] = list;
    return Math.atan2(t2.y - t1.y, t2.x - t1.x);
  }
}
