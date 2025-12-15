import { describe, it, expect } from "vitest";
import { DummyHost } from "./DummyHost.js";
import { TestController } from "./TestController.js";

describe("AbstractReactiveController", () => {
  it("calls onAttach", () => {
    const ctrl = new TestController();
    ctrl.attachTo(new DummyHost());
    expect(ctrl.events).toEqual(["attach"]);
  });

  it("calls onDetach", () => {
    const ctrl = new TestController();
    ctrl.attachTo(new DummyHost());
    ctrl.detachFrom?.(new DummyHost());
    expect(ctrl.events).toEqual(["attach", "detach"]);
  });
});
