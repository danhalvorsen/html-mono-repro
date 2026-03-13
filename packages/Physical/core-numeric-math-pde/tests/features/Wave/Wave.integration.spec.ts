import { describe, expect, it } from "vitest";
import { WaveFixture } from "./WaveFixture.js";

describe("Wave feature integration", () => {
  it("should solve a 1D impulse scenario over multiple steps", () => {
    const fixture = new WaveFixture();
    const { state, workspace, solver } = fixture.createImpulse1D();

    const snapshots = solver.solve(state, workspace, 0, 0.25, 3);

    expect(snapshots).toHaveLength(4);
    expect(snapshots[0].time).toBe(0);
    expect(snapshots[1].time).toBe(0.25);
    expect(snapshots[3].time).toBe(0.75);

    expect(fixture.read(snapshots[0].state.current)).toEqual([0, 0, 1, 0, 0]);
    expect(fixture.read(snapshots[1].state.current)).toEqual([0, 0.0625, 1.875, 0.0625, 0]);
  });
});