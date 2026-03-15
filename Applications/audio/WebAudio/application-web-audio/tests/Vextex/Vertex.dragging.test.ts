// Applications/audio/WebAudio/application-web-audio/tests/Vextex/VexVertexVisualShape.drag.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { VexVertexVisualShapeDragFixture } from "./Fixtures/VertexVisualShapeDragFixture.js";

describe("VexVertexVisualShape drag behavior", () => {
  let fixture: VexVertexVisualShapeDragFixture;

  beforeEach(async () => {
    fixture = await new VexVertexVisualShapeDragFixture().initialize();
  });

  afterEach(() => {
    fixture.dispose();
  });

  it("should drag vertex center when pointer starts inside vertex", () => {
    fixture.pointerDown({ x: 80, y: 90 });
    fixture.pointerMove({ x: 100, y: 110 });
    fixture.pointerUp();

    expect(fixture.vertex.center).toEqual(new Vector2(100, 110));
  });
});