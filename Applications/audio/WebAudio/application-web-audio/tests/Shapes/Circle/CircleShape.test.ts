// Applications/audio/WebAudio/application-web-audio/tests/CircleShape.drag.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { CircleShapeDragFixture } from "./fixtures/CircleShapeDragFixture.js";

describe("CircleShape drag behavior", () => {
  let fixture: CircleShapeDragFixture;

  beforeEach(async () => {
    fixture = await new CircleShapeDragFixture().initialize();
  });

  afterEach(() => {
    fixture.dispose();
  });

  it("should drag the circle", () => {
    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 100, y: 120 });
    fixture.pointerUp();

    expect(fixture.circle.center).toEqual(new Vector2(100, 120));
  });
});