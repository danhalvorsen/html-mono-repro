/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";

import {
  createCircularDraggingFixture,
  dispatchPointerFixtureEvent,
} from "./fixtures/circularDraggingFixtures.js";

describe("OnCircularDragging", () => {
  it("reports clockwise dragging and normalized speed", () => {
    const { host, controller } = createCircularDraggingFixture({
      maxAngularVelocity: 10,
    });

    dispatchPointerFixtureEvent(host, "pointerdown", { clientX: 100, clientY: 50, timeStamp: 0 });
    dispatchPointerFixtureEvent(window, "pointermove", { clientX: 50, clientY: 100, timeStamp: 100 });

    expect(controller.isDragging).toBe(true);
    expect(controller.sample.direction).toBe("cw");
    expect(controller.sample.normalizedSpeed).toBeGreaterThan(0);
    expect(controller.sample.normalizedSpeed).toBeLessThanOrEqual(1);
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it("reports counter-clockwise dragging and resets on pointer up", () => {
    const { host, controller } = createCircularDraggingFixture();

    dispatchPointerFixtureEvent(host, "pointerdown", { clientX: 50, clientY: 0, timeStamp: 0 });
    dispatchPointerFixtureEvent(window, "pointermove", { clientX: 100, clientY: 50, timeStamp: 100 });
    dispatchPointerFixtureEvent(window, "pointerup", { clientX: 100, clientY: 50, timeStamp: 120 });

    expect(controller.sample.direction).toBe("none");
    expect(controller.sample.isDragging).toBe(false);
  });

  it("exports the renamed controller class semantics", () => {
    const fixture = createCircularDraggingFixture();
    expect(fixture.controller.constructor.name).toBe("OnCircularDraggingController");
  });
});
