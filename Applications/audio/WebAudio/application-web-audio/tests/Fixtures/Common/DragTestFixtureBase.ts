// Fix 2: tests/fixtures/DragTestFixtureBase.ts
// Wait for custom elements in tests before first pointer interaction.

import type { Point } from "@monorepo/core-math";

import { DragController } from "../../../src/index.js";
import { TestReactiveHost } from "../TestReactiveHost.js";
 
export abstract class DragTestFixtureBase {
  public readonly host: TestReactiveHost;
  public readonly controller: DragController;
  public readonly root: HTMLDivElement;

  protected constructor() {
    this.host = new TestReactiveHost();
    this.root = document.createElement("div");
    document.body.append(this.root);

    this.controller = new DragController(this.host, () => Array.from(this.root.children));
    this.host.connect();
  }

  public pointerDown(point: Point): void {
    this.controller.onPointerDown(point);
  }

  public pointerMove(point: Point): void {
    this.controller.onPointerMove(point);
  }

  public pointerUp(): void {
    this.controller.onPointerUp();
  }

  public async flush(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
  }

  public dispose(): void {
    this.host.disconnect();
    this.root.remove();
  }
}