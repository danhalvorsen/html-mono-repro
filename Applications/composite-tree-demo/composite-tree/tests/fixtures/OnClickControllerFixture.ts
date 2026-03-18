// tests/fixtures/OnClickControllerFixture.ts

import type { ReactiveController } from "lit";

import { OnClickController } from '../../src/index.js';

export interface ITestReactiveElement
  extends HTMLElement {
  addController(controller: ReactiveController): void;
  removeController(controller: ReactiveController): void;
  connect(): void;
  disconnect(): void;
  clickHost(): void;
}

class TestReactiveElement
  extends HTMLElement
  implements ITestReactiveElement
{
  private readonly controllers: ReactiveController[] = [];

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);

    if (index >= 0) {
      this.controllers.splice(index, 1);
    }
  }

  public connect(): void {
    for (const controller of this.controllers) {
      controller.hostConnected?.();
    }
  }

  public disconnect(): void {
    for (const controller of this.controllers) {
      controller.hostDisconnected?.();
    }
  }

  public clickHost(): void {
    this.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (!customElements.get("test-reactive-click-host")) {
  customElements.define("test-reactive-click-host", TestReactiveElement);
}

export class ClickHandlerSpy {
  public readonly calls: MouseEvent[] = [];

  public onClick(event: MouseEvent): void {
    this.calls.push(event);
  }
}

export class OnClickControllerFixture {
  public readonly host: ITestReactiveElement;

  public constructor() {
    this.host = document.createElement(
      "test-reactive-click-host",
    ) as ITestReactiveElement;
  }

  public createWithFunctionHandler(
    handler?: (event: MouseEvent) => void,
  ): {
    controller: OnClickController;
    calls: MouseEvent[];
  } {
    const calls: MouseEvent[] = [];

    const controller = new OnClickController(this.host as never, {
      handler: handler ?? ((event: MouseEvent): void => {
        calls.push(event);
      }),
    });

    return {
      controller,
      calls,
    };
  }

  public createWithObjectHandler(
    handler?: ClickHandlerSpy,
  ): {
    controller: OnClickController;
    handler: ClickHandlerSpy;
  } {
    const clickHandler = handler ?? new ClickHandlerSpy();

    const controller = new OnClickController(this.host as never, {
      handler: clickHandler,
    });

    return {
      controller,
      handler: clickHandler,
    };
  }

  public connect(): void {
    this.host.connect();
  }

  public disconnect(): void {
    this.host.disconnect();
  }

  public click(): void {
    this.host.clickHost();
  }
}
