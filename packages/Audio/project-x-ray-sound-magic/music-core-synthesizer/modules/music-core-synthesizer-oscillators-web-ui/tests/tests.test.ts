// tests/tests.test.ts
import { describe, expect, it } from "vitest";
import * as moduleExports from "../src/index.js";

describe("music-core-synthesizer-oscillators-web-ui", () => {
  it("exports oscillator control component contract", () => {
    expect(moduleExports.OscillatorControlEvents).toBeDefined();
  });
});