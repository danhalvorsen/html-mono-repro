// Applications/audio/WebAudio/application-web-audio/tests/CircleShape.drag.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { CircleShapeDragFixture } from "./Fixtures/CircleShapeDragFixture.js";

describe("CircleShape drag operations", () => {
  let fixture: CircleShapeDragFixture;

  beforeEach(async () => {
    fixture = await new CircleShapeDragFixture({
      center: new Vector2(80, 90),
      radius: 10,
    }).initialize();
  });

  afterEach(() => {
    fixture.dispose();
  });

  it("should drag a CircleShape when pointer starts inside it", () => {
    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 100, y: 110 });
    fixture.pointerUp();

    expect(fixture.circle.center).toEqual(new Vector2(100, 110));
  });

  it("should stop dragging a CircleShape after pointer up", () => {
    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 100, y: 110 });
    fixture.pointerUp();
    fixture.pointerMove({ x: 140, y: 150 });

    expect(fixture.circle.center).toEqual(new Vector2(100, 110));
  });

  it("should not drag when pointer starts outside the CircleShape", () => {
    fixture.pointerDown({ x: 200, y: 200 });
    fixture.pointerMove({ x: 220, y: 230 });
    fixture.pointerUp();

    expect(fixture.circle.center).toEqual(new Vector2(80, 90));
  });

  it("should request host update while dragging", () => {
    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 90, y: 95 });
    fixture.pointerUp();

    expect(fixture.host.requestUpdateCalls).toBeGreaterThan(0);
  });
});