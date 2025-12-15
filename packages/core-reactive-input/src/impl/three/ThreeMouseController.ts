import { IMouseController } from "../../abstractions/IMouseController.js";
import { IMouseEvent } from "../../abstractions/IMouseEvent.js";
import { MouseEventType } from "../../abstractions/MouseEventType.js";
import * as THREE from "three";

/**
 * Mouse input controller for Three.js scenes.
 * Converts DOM pointer events into world-space intersection data.
 */

export class ThreeMouseController implements IMouseController {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly raycaster = new THREE.Raycaster();
  private readonly handlers = new Map<MouseEventType, Set<(e: IMouseEvent) => void>>();
  private readonly boundWrappers = new Map<MouseEventType, (ev: Event) => void>();
  private active = false;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    const opts: AddEventListenerOptions = { passive: false };
    const eventTypes: MouseEventType[] = ["pointerdown", "pointermove", "pointerup", "click", "wheel"];
    for (const type of eventTypes) {
      const wrapper = (ev: Event) => this.emit(type, ev as PointerEvent);
      this.boundWrappers.set(type, wrapper);
      this.canvas.addEventListener(type, wrapper, opts);
    }
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    for (const [type, wrapper] of this.boundWrappers) {
      this.canvas.removeEventListener(type, wrapper);
    }
    this.boundWrappers.clear();
  }

  on(type: MouseEventType, handler: (e: IMouseEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: MouseEventType, handler: (e: IMouseEvent) => void): void {
    this.handlers.get(type)?.delete(handler);
  }

  destroy(): void {
    this.disable();
    this.handlers.clear();
  }

  private emit(type: MouseEventType, e: PointerEvent | WheelEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(ndc, this.camera);
    const intersections = this.raycaster.intersectObjects(this.scene.children, true);

    const args: IMouseEvent = {
      type,
      x: e.clientX,
      y: e.clientY,
      button: (e as PointerEvent).button ?? 0,
      deltaX: (e as WheelEvent).deltaX ?? 0,
      deltaY: (e as WheelEvent).deltaY ?? 0,
      target: intersections[0]?.object ?? e.target,
      originalEvent: e,
      modifiers: {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      },
    };

    this.handlers.get(type)?.forEach(h => h(args));
  }
}
