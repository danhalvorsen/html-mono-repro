import { describe, it, expect } from "vitest";
import { NewGradientStopFixture } from "./fixtures/NewGradientStopFixture.js";

describe("NewGradientStop", () => {
  const fixture = new NewGradientStopFixture();

  it("should create stop with position and color", () => {
    const color = fixture.createColorA();
    const sut = fixture.createAt(0.25, color);

    expect(sut.position).toBe(0.25);
    expect(sut.color.equals(color)).toBe(true);
  });

  it("should reject invalid position below range", () => {
    expect(() => fixture.createAt(-0.01)).toThrowError(
      "Gradient stop position must be in range [0..1]. Received '-0.01'.",
    );
  });

  it("should reject invalid position above range", () => {
    expect(() => fixture.createAt(1.01)).toThrowError(
      "Gradient stop position must be in range [0..1]. Received '1.01'.",
    );
  });
});
