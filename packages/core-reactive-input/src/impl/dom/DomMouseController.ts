import { IMouseController } from "../../abstractions/IMouseController.js";
import { IMouseEvent } from "../../abstractions/IMouseEvent.js";
import { MouseEventType } from "../../abstractions/MouseEventType.js";

/**
 * Singleton mouse input controller for DOM environments.
 * Normalizes mouse and pointer events and emits IMouseEvent objects.
 */
export class DomMouseController implements IMouseController {
  private static _instance: DomMouseController | null = null;
  public static get instance(): DomMouseController {
    if (!this._instance) this._instance = new DomMouseController(document);
    return this._instance;
  }

  private readonly root: HTMLElement | Document;
  private readonly handlers = new Map<MouseEventType, Set<(e: IMouseEvent) => void>>();
  private readonly boundWrappers = new Map<MouseEventType, (ev: Event) => void>();
  private active = false;

  private constructor(root: HTMLElement | Document) {
    this.root = root;
  }

  /** Enable all global mouse/pointer listeners (once) */
  public enable(): void {
    if (this.active) return;
    this.active = true;
    const eventTypes: MouseEventType[] = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "click",
      "wheel",
      "contextmenu"
    ];

    const opts: AddEventListenerOptions = { passive: false };
    for (const type of eventTypes) {
      const wrapper = (ev: Event) => this.emit(type, ev as PointerEvent);
      this.boundWrappers.set(type, wrapper);
      this.root.addEventListener(type, wrapper, opts);
    }
  }

  /** Disable all global listeners */
  public disable(): void {
    if (!this.active) return;
    this.active = false;
    for (const [type, wrapper] of this.boundWrappers) {
      this.root.removeEventListener(type, wrapper);
    }
    this.boundWrappers.clear();
  }

  /** Subscribe to mouse/pointer events */
  public on(type: MouseEventType, handler: (e: IMouseEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  /** Unsubscribe handler */
  public off(type: MouseEventType, handler: (e: IMouseEvent) => void): void {
    this.handlers.get(type)?.delete(handler);
  }

  /** Release all resources */
  public destroy(): void {
    this.disable();
    this.handlers.clear();
  }

  // -------------------------------------------------------------------
  // Internal event normalization
  // -------------------------------------------------------------------
  private emit(type: MouseEventType, e: PointerEvent | WheelEvent): void {
    const args: IMouseEvent = {
      type,
      x: e.clientX,
      y: e.clientY,
      button: (e as PointerEvent).button ?? 0,
      deltaX: (e as WheelEvent).deltaX ?? 0,
      deltaY: (e as WheelEvent).deltaY ?? 0,
      target: e.target as HTMLElement,
      originalEvent: e,
      modifiers: {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      },
    };
    this.handlers.get(type)?.forEach((h) => h(args));
  }
}
