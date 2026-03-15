// Applications/audio/WebAudio/application-web-audio/tests/Vextex/VexLineShapeVerifier.ts

import { Vector2 } from "@monorepo/core-math";
import { expect } from "vitest";
import { VexLineShapeFixture } from "../Fixtures/VertexLineShapeFixture.js";

export class VexLineShapeVerifier {
  public constructor(private readonly fixture: VexLineShapeFixture) {}

  public hasId(expected: string): void {
    expect(this.fixture.adapter.getId()).toBe(expected);
  }

  public hasCenter(expected: Vector2): void {
    expect(this.fixture.adapter.getCenter()).toEqual(expected);
  }

  public hasPosition(expected: Vector2): void {
    expect(this.fixture.adapter.getPosition()).toEqual(expected);
  }

  public hasWidth(expected: number): void {
    expect(this.fixture.adapter.getWidth()).toBe(expected);
  }

  public hasHeight(expected: number): void {
    expect(this.fixture.adapter.getHeight()).toBe(expected);
  }

  public startPositionIs(expected: Vector2): void {
    expect(this.fixture.start.getPosition()).toEqual(expected);
  }

  public endPositionIs(expected: Vector2): void {
    expect(this.fixture.end.getPosition()).toEqual(expected);
  }

  public hitTestIs(point: Vector2, expected: boolean): void {
    expect(this.fixture.hitTest(point)).toBe(expected);
  }

  public renderedLine(expectedStart: Vector2, expectedEnd: Vector2): void {
    const log = this.fixture.contextSpy.log;

    expect(log.save).toBe(1);
    expect(log.restore).toBe(1);
    expect(log.moveTo).toEqual([[expectedStart.x, expectedStart.y]]);
    expect(log.lineTo).toEqual([[expectedEnd.x, expectedEnd.y]]);
  }

  public renderedVisibleVertices(expected: ReadonlyArray<readonly [number, number, number]>): void {
    const arcs = this.fixture.contextSpy.log.arc;

    expect(arcs).toHaveLength(expected.length);

    for (let index = 0; index < expected.length; index++) {
      const current = expected[index];
      expect(arcs[index]).toEqual([current[0], current[1], current[2], 0, Math.PI * 2]);
    }
  }

  public renderedNoVertices(): void {
    expect(this.fixture.contextSpy.log.arc).toHaveLength(0);
  }
}