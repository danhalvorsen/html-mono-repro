import { describe, expect, it } from "vitest";

import { createActivateControllerFixture } from "./fixtures/activateControllerFixtures.js";

describe("ActivateController", () => {
  it("should initialize the host as inactive by default", () => {
    const { host, controller } = createActivateControllerFixture();

    expect(controller.active).toBe(false);
    expect(controller.state).toBe("inactive");
    expect(host.active).toBe(false);
    expect(host.state).toBe("inactive");
  });

  it("should initialize the host as active when configured", () => {
    const { host, controller } = createActivateControllerFixture({
      initialActive: true,
    });

    expect(controller.active).toBe(true);
    expect(controller.state).toBe("active");
    expect(host.active).toBe(true);
    expect(host.state).toBe("active");
  });

  it("should activate and request an update", () => {
    const { host, controller } = createActivateControllerFixture();

    controller.activate();

    expect(controller.active).toBe(true);
    expect(host.active).toBe(true);
    expect(host.state).toBe("active");
    expect(host.requestUpdateCallCount).toBe(1);
  });

  it("should deactivate and request an update", () => {
    const { host, controller } = createActivateControllerFixture({
      initialActive: true,
    });

    controller.deactivate();

    expect(controller.active).toBe(false);
    expect(host.active).toBe(false);
    expect(host.state).toBe("inactive");
    expect(host.requestUpdateCallCount).toBe(1);
  });

  it("should toggle between active and inactive", () => {
    const { host, controller } = createActivateControllerFixture();

    controller.toggle();
    controller.toggle();

    expect(controller.active).toBe(false);
    expect(host.active).toBe(false);
    expect(host.state).toBe("inactive");
    expect(host.requestUpdateCallCount).toBe(2);
  });

  it("should not request an update when the active value is unchanged", () => {
    const { host, controller } = createActivateControllerFixture();

    controller.setActive(false);

    expect(host.requestUpdateCallCount).toBe(0);
  });
});
