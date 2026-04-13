import { vi } from "vitest";
import type { ReactiveController } from "lit";

import { OnCircularDraggingController } from "../../src/Controllers/OnCircularDragging.js";
import type { IOnCircularDraggingOptions } from "../../src/Controllers/OnCircularDragging.js";

export class FakeCircularDraggingHost extends EventTarget {
  public readonly controllers: ReactiveController[] = [];
  public readonly requestUpdate = vi.fn();

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public getBoundingClientRect(): DOMRect {
    return {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  }
}

export interface IPointerFixtureInput {
  readonly clientX: number;
  readonly clientY: number;
  readonly timeStamp: number;
  readonly pointerId?: number;
}

export function dispatchPointerFixtureEvent(
  target: EventTarget,
  type: string,
  input: IPointerFixtureInput,
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: input.clientX,
    clientY: input.clientY,
    button: 0,
  }) as PointerEvent;

  Object.defineProperty(event, "pointerId", { value: input.pointerId ?? 1 });
  Object.defineProperty(event, "timeStamp", { value: input.timeStamp });
  target.dispatchEvent(event);
}

export function createCircularDraggingFixture(
  options: IOnCircularDraggingOptions = {},
): {
  readonly host: FakeCircularDraggingHost;
  readonly controller: OnCircularDraggingController;
} {
  const host = new FakeCircularDraggingHost();
  const controller = new OnCircularDraggingController(host, options);
  controller.hostConnected();

  return Object.freeze({
    host,
    controller,
  });
}
