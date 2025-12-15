import { describe, it, expect } from "vitest";
import { AbstractReactiveHost } from "../src/abstract/AbstractReactiveHost.js";
import { AbstractReactiveController } from "../src/abstract/AbstractReactiveController.js";

class TestController extends AbstractReactiveController {
  public events: string[] = [];
  protected onAttach() { this.events.push("attach"); }
  protected onDetach() { this.events.push("detach"); }

  onHostConnectednnected() { this.events.push("connected"); }
  onHostDisconnected() { this.events.push("disconnected"); }
  onHostUpdate() { this.events.push("update"); }
  onHostUpdated() { this.events.push("updated"); }
}

class TestHost extends AbstractReactiveHost {}

describe("AbstractReactiveHost", () => {
  it("attaches controller", () => {
    const host = new TestHost();
    const ctrl = new TestController();
    host.addController(ctrl);
    expect(ctrl.events).toEqual(["attach"]);
  });

  it("detaches controller", () => {
    const host = new TestHost();
    const ctrl = new TestController();
    host.addController(ctrl);
    host.removeController(ctrl);
    expect(ctrl.events).toEqual(["attach", "detach"]);
  });

  it("propagates lifecycle", () => {
    const host = new TestHost();
    const ctrl = new TestController();
    host.addController(ctrl);

    host.notifyConnected();
    host.notifyUpdate();
    host.notifyUpdated();
    host.notifyDisconnected();

    expect(ctrl.events).toEqual([
      "attach",
      "connected",
      "update",
      "updated",
      "disconnected"
    ]);
  });
});
