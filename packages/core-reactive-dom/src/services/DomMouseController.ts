import { DomReactiveController } from "./DomReactiveController.js";

/**
 * DOM implementation of IMouseController.
 * Centralized mouse/pointer event dispatch.
 */
export class DomMouseController
  extends DomReactiveController
  implements IMouseController
{
  static readonly instance = new DomMouseController();

  protected onAttach(): void {}
  protected onDetach(): void {}
  private readonly handlers = new Map<
    MouseEventType,
    Set<(suite('', () => {
    
      suiteSetup(() => { });
    
      test('', () => {
        
      });
    
      suiteTeardown(() => { });
    });: MouseEventArgs) => void>
  >();
  private readonly boundWrappers = new Map<
    MouseEventType,
    (ev: Event) => void
  >();
  private enabled = false;

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    for (const [type, wrapper] of this.boundWrappers) {
      this.element.removeEventListener(type, wrapper);
    }
    this.boundWrappers.clear();
  }

  destroy(): void {
    this.disable();
    this.handlers.clear();
  }

  on(type: MouseEventType, handler: (e: MouseEventArgs) => void): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
      const wrapper = (ev: Event) => this.emit(type, ev as PointerEvent);
      this.boundWrappers.set(type, wrapper);
      this.element.addEventListener(type, wrapper, false);
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: MouseEventType, handler: (e: MouseEventArgs) => void): void {
    const set = this.handlers.get(type);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      const wrapper = this.boundWrappers.get(type);
      if (wrapper) {
        this.element.removeEventListener(type, wrapper);
        this.boundWrappers.delete(type);
      }
      this.handlers.delete(type);
    }
  }

  private emit(type: MouseEventType, e: PointerEvent): void {
    const args: MouseEventArgs = {
      type,
      x: e.clientX,
      y: e.clientY,
      button: e.button,
      deltaX: (e as any).deltaX ?? 0,
      deltaY: (e as any).deltaY ?? 0,
      target: e.target,
      originalEvent: e
    };
    this.handlers.get(type)?.forEach((h) => h(args));
  }
}
