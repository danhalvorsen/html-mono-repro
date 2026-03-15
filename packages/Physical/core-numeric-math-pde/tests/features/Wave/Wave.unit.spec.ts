// tests/features/wave/Wave.unit.spec.ts

import { describe, expect, it } from "vitest";
import { WaveFixture } from "./WaveFixture.js";

describe("Wave feature", () => {
  it("should rotate buffers after one 1D wave step", () => {
    const fixture = new WaveFixture();
    const { state, workspace, stepper } = fixture.createImpulse1D();

    stepper.step(state, workspace, 1);

    expect(fixture.read(state.previous)).toEqual([0, 0, 1, 0, 0]);
    expect(fixture.read(state.current)).toEqual([0, 1, 0, 1, 0]);
  });
});