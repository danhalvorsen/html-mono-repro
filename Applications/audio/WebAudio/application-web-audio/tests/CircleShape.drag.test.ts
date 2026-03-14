// Applications/audio/WebAudio/application-web-audio/tests/CircleShape.drag.test.ts

import { afterEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { createCircleShapeDragFixture } from "./fixtures/createCircleShapeDragFixture.js";

describe("CircleShape drag operations", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should drag a CircleShape when pointer starts inside the circle", async () => {
    const fixture = await createCircleShapeDragFixture({
      center: new Vector2(80, 90),
      radius: 10,
    });

    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 100, y: 115 });
    fixture.pointerUp();

    expect(fixture.circle.center).toEqual(new Vector2(100, 115));
    expect(fixture.circle.getPosition()).toEqual(new Vector2(90, 105));
    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should preserve radius when CircleShape is dragged", async () => {
    const fixture = await createCircleShapeDragFixture({
      center: new Vector2(50, 60),
      radius: 12,
    });

    fixture.pointerDown({ x: 50, y: 60 });
    fixture.pointerMove({ x: 90, y: 110 });
    fixture.pointerUp();

    expect(fixture.circle.radius).toBe(12);
    expect(fixture.circle.center).toEqual(new Vector2(90, 110));
    expect(fixture.circle.getWidth()).toBe(24);
    expect(fixture.circle.getHeight()).toBe(24);
  });

  it("should not drag a CircleShape when pointer starts outside the circle", async () => {
    const fixture = await createCircleShapeDragFixture({
      center: new Vector2(100, 100),
      radius: 20,
    });

    fixture.pointerDown({ x: 200, y: 200 });
    fixture.pointerMove({ x: 240, y: 260 });
    fixture.pointerUp();

    expect(fixture.circle.center).toEqual(new Vector2(100, 100));
    expect(fixture.circle.getPosition()).toEqual(new Vector2(80, 80));
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });

  it("should stop dragging a CircleShape after pointer up", async () => {
    const fixture = await createCircleShapeDragFixture({
      center: new Vector2(30, 40),
      radius: 8,
    });

    fixture.pointerDown({ x: 30, y: 40 });
    fixture.pointerMove({ x: 45, y: 50 });
    fixture.pointerUp();
    fixture.pointerMove({ x: 70, y: 80 });

    expect(fixture.circle.center).toEqual(new Vector2(45, 50));
    expect(fixture.circle.getPosition()).toEqual(new Vector2(37, 42));
    expect(fixture.host.requestUpdateCalls).toBe(1);
  });
});