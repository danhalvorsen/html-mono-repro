// ====================================================================================
// FILE: tests/fixtures/createShapeTestHost.ts
// ====================================================================================

import { LitElement, type ReactiveController, type ReactiveControllerHost } from "lit";

export type ShapeTestHost = ReactiveControllerHost & {
  readonly updates: number;
  connect(): void;
  disconnect(): void;
};

class TestHost extends LitElement implements ShapeTestHost {
  private updateCount = 0;

  public get updates(): number {
    return this.updateCount;
  }

  public override requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: unknown,
  ): void {
    this.updateCount++;
    super.requestUpdate(name, oldValue, options as never);
  }

  public connect(): void {
    for (const controller of this.getControllers()) {
      controller.hostConnected?.();
    }
  }

  public disconnect(): void {
    for (const controller of this.getControllers()) {
      controller.hostDisconnected?.();
    }
  }

  private getControllers(): readonly ReactiveController[] {
    return (this as unknown as { __controllers?: ReactiveController[] }).__controllers ?? [];
  }
}

export function createShapeTestHost(): ShapeTestHost {
  return new TestHost();
}