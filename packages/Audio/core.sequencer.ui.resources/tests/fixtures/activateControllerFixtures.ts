import type { ReactiveController, ReactiveControllerHost } from "lit";

import {
  ActivateController,
  type ActivationState,
  type IActivateControllerOptions,
} from "../../src/Controllers/ActivateController.js";

export interface IActivateControllerHostFixture extends ReactiveControllerHost {
  active: boolean;
  state: ActivationState;
  requestUpdateCallCount: number;
}

export function createActivateControllerHostFixture(): IActivateControllerHostFixture {
  return {
    active: false,
    state: "inactive",
    requestUpdateCallCount: 0,
    addController(controller: ReactiveController): void {
      controller.hostConnected?.();
    },
    removeController(): void {
      // no-op fixture hook
    },
    requestUpdate(): void {
      this.requestUpdateCallCount += 1;
    },
    updateComplete: Promise.resolve(true),
  };
}

export function createActivateControllerFixture(
  options: IActivateControllerOptions = {},
): {
  readonly host: IActivateControllerHostFixture;
  readonly controller: ActivateController;
} {
  const host = createActivateControllerHostFixture();
  const controller = new ActivateController(host, options);
  return { host, controller };
}
