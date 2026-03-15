// Applications/audio/WebAudio/application-web-audio/tests/EdgeShape.unit.test.ts

import { afterEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { EdgeShapeDragFixture } from "./EdgeShapeDragFixture.js";

describe("EdgeShape handle dragging through DragController", () => {
  const disposables: Array<{ dispose(): void }> = [];

  afterEach(() => {
    while (disposables.length > 0) {
      disposables.pop()?.dispose();
    }
  });

  async function createFixture(): Promise<EdgeShapeDragFixture> {
    const fixture = await new EdgeShapeDragFixture({ debug: true }).initialize();
    disposables.push(fixture);
    return fixture;
  }

  it("should drag p0 when pointer starts on the start CircleShape", async () => {
    const fixture = await createFixture();

    fixture.pointerDown({ x: 80, y: 80 });
    fixture.pointerMove({ x: 100, y: 95 });
    fixture.pointerUp();

    expect(fixture.edge.p0).toEqual(new Vector2(100, 95));
    expect(fixture.edge.p1).toEqual(new Vector2(220, 160));
    expect(fixture.edge.getPosition()).toEqual(new Vector2(100, 95));
  });

  it("should drag p1 when pointer starts on the end CircleShape", async () => {
    const fixture = await createFixture();

    fixture.pointerDown({ x: 220, y: 160 });
    fixture.pointerMove({ x: 260, y: 210 });
    fixture.pointerUp();

    expect(fixture.edge.p0).toEqual(new Vector2(80, 80));
    expect(fixture.edge.p1).toEqual(new Vector2(260, 210));
    expect(fixture.edge.getPosition()).toEqual(new Vector2(80, 80));
  });

  it("should change edge length when dragging the start CircleShape", async () => {
    const fixture = await createFixture();

    const before = fixture.getLength();

    fixture.pointerDown({ x: 80, y: 80 });
    fixture.pointerMove({ x: 120, y: 120 });
    fixture.pointerUp();

    const after = fixture.getLength();

    expect(after).not.toBe(before);
    expect(fixture.edge.p0).toEqual(new Vector2(120, 120));
    expect(fixture.edge.p1).toEqual(new Vector2(220, 160));
    expect(fixture.edge.getWidth()).toBe(100);
    expect(fixture.edge.getHeight()).toBe(40);
  });

  it("should change edge length when dragging the end CircleShape", async () => {
    const fixture = await createFixture();

    const before = fixture.getLength();

    fixture.pointerDown({ x: 220, y: 160 });
    fixture.pointerMove({ x: 280, y: 140 });
    fixture.pointerUp();

    const after = fixture.getLength();

    expect(after).not.toBe(before);
    expect(fixture.edge.p0).toEqual(new Vector2(80, 80));
    expect(fixture.edge.p1).toEqual(new Vector2(280, 140));
    expect(fixture.edge.getWidth()).toBe(200);
    expect(fixture.edge.getHeight()).toBe(60);
  });
});