// src/dom/DomTouchController.ts
import { ITouchController, ITouchEvent, TouchEventType } from "../../abstractions/ITouchController.js";

export class DomTouchController implements ITouchController {
  private static _instance: DomTouchController | null = null;
  public static get instance(): DomTouchController {
    if (!this._instance) this._instance = new DomTouchController(document);
    return this._instance;
  }

  private readonly root: HTMLElement | Document;
  private readonly handlers = new Map<TouchEventType, Set<(e: ITouchEvent) => void>>();
  private readonly boundWrappers = new Map<TouchEventType, (ev: Event) => void>();

  private constructor(root: HTMLElement | Document) {
    this.root = root;
  }

  /** enable all listeners once */
  public enable(): void {
    if (this.boundWrappers.size > 0) return;
    const opts = { passive: false };
    const eventTypes: TouchEventType[] = ["touchstart", "touchmove", "touchend", "touchcancel"];
    for (const type of eventTypes) {
      const wrapper = (ev: Event) => this.emit(type, ev as TouchEvent);
      this.boundWrappers.set(type, wrapper);
      this.root.addEventListener(type, wrapper, opts);
    }
  }

  /** disable all listeners */
  public disable(): void {
    for (const [type, wrapper] of this.boundWrappers) {
      this.root.removeEventListener(type, wrapper);
    }
    this.boundWrappers.clear();
  }

  on(type: TouchEventType, handler: (e: ITouchEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: TouchEventType, handler: (e: ITouchEvent) => void): void {
    this.handlers.get(type)?.delete(handler);
  }

  private emit(type: TouchEventType, ev: TouchEvent) {
    const touches = Array.from(ev.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    const changedTouches = Array.from(ev.changedTouches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    const args: ITouchEvent = {
      type,
      x: ev.touches[0]?.clientX ?? 0,
      y: ev.touches[0]?.clientY ?? 0,
      touches,
      changedTouches,
      originalEvent: ev,
      target: ev.target as HTMLElement,
      modifiers: { alt: ev.altKey, ctrl: ev.ctrlKey, shift: ev.shiftKey, meta: ev.metaKey },
    };
    this.handlers.get(type)?.forEach(h => h(args));
  }

  destroy(): void {
    this.disable();
    this.handlers.clear();
  }
}
