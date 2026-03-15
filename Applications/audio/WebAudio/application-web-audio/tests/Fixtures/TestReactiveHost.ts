// Applications/audio/WebAudio/application-web-audio/tests/fixtures/TestReactiveHost.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

export class TestReactiveHost implements ReactiveControllerHost {
  private readonly controllers: ReactiveController[] = [];

  public requestUpdateCalls = 0;
  public readonly updateComplete: Promise<boolean> = Promise.resolve(true);

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);

    if (index >= 0) {
      this.controllers.splice(index, 1);
    }
  }

  public requestUpdate(): void {
    this.requestUpdateCalls += 1;
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

  public hasController(controller: ReactiveController): boolean {
    return this.controllers.includes(controller);
  }
}