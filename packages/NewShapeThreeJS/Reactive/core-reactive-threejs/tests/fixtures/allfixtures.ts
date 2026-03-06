import { Renderer } from "three/src/Three.js";
import { MouseController } from "../../src/controllers/mouse/MouseController.js";
// tests/fixtures/ReactiveHostFixture.ts
import { ReactiveHost } from "../../src/host/ReactiveHost.js";
import { CanvasViewRuntime } from "../../src/index.js";
import { EventReactiveHost } from "../../src/host/EventReactiveHost.js";
 
export class CanvasViewRuntimeFixture {
  public readonly runtime: CanvasViewRuntime;

  constructor() {
    this.runtime = new CanvasViewRuntime();
  }
}

export class EventReactiveHostFixture {
  public readonly host: EventReactiveHost;

  constructor() {
    this.host = new EventReactiveHost();
  }
}

export class MouseControllerFixture {
  public readonly mouse: MouseController;

  constructor() {
    this.mouse = new MouseController();
  }
}

export class ReactiveControllerFixture {
  public readonly controller: ReactiveController;

  constructor() {
    this.controller = new ReactiveController();
  }
}

export class ReactiveHostFixture {
  public readonly host: ReactiveHost;

  constructor() {
    this.host = new ReactiveHost();
  }
}

export class ReactiveShapeControllerFixture {
  public readonly controller: ReactiveShapeController;

  constructor() {
    this.controller = new ReactiveShapeController();
  }
}

export class RendererFixture {
  public readonly renderer: Renderer;

  constructor() {
    this.renderer = new Renderer();
  }
}