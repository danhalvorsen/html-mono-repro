import { ITouchController, ITouchEvent, TouchEventType } from "../../abstractions/ITouchController.js";
import * as THREE from "three";

/**
 * Touch controller for Three.js scenes.
 * Converts multi-touch DOM events into 3D intersection data.
 */
export class ThreeTouchController implements ITouchController {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly raycaster = new THREE.Raycaster();
  private readonly handlers = new Map<TouchEventType, Set<(e: ITouchEvent) => void>>();
  private readonly bound = new Map<TouchEventType, (ev: Event) => void>();
  private active = false;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    const opts = { passive: false };
    const events: TouchEventType[] = ["touchstart", "touchmove", "touchend", "touchcancel"];
    for (const type of events) {
      const wrapper = (ev: Event) => this.emit(type, ev as TouchEvent);
      this.bound.set(type, wrapper);
      this.canvas.addEventListener(type, wrapper, opts);
    }
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    for (const [type, wrapper] of this.bound) {
      this.canvas.removeEventListener(type, wrapper);
    }
    this.bound.clear();
  }

  on(type: TouchEventType, handler: (e: ITouchEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: TouchEventType, handler: (e: ITouchEvent) => void): void {
    this.handlers.get(type)?.delete(handler);
  }

  destroy(): void {
    this.disable();
    this.handlers.clear();
  }

  private emit(type: TouchEventType, e: TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const touches = Array.from(e.touches).map(t => {
      const ndc = new THREE.Vector2(
        ((t.clientX - rect.left) / rect.width) * 2 - 1,
        -((t.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, this.camera);
      const intersections = this.raycaster.intersectObjects(this.scene.children, true);
      return {
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        target: intersections[0]?.object ?? e.target,
      };
    });

    const args: ITouchEvent = {
      type,
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0,
      touches,
      changedTouches: [],
      modifiers: {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      },
      originalEvent: e,
      target: e.target as HTMLElement,
    };

    this.handlers.get(type)?.forEach(h => h(args));
  }
}
