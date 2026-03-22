
import { describe, expect, it } from "vitest";
import { NewGradient, NewGradientStop } from "../src/index.js";
import { NewGradientFixture } from "./fixtures/NewGradientFixture.js";

describe("NewGradient", () => {
  const fixture = new NewGradientFixture();

  it("should return correct name", () => {
    const sut = fixture.createGradient();

    expect(sut.name).toBe("fixture-gradient");
  });

  it("should return correct count", () => {
    const sut = fixture.createGradient();

    expect(sut.count).toBe(3);
  });

  it("should sort stops", () => {
    const sut = fixture.createUnorderedGradient();

    expect(sut.getAt(0).position).toBe(0);
    expect(sut.getAt(1).position).toBe(0.5);
    expect(sut.getAt(2).position).toBe(1);
  });

  it("should normalize empty name", () => {
    const sut = NewGradient.create([
      NewGradientStop.create(0, fixture.createColorA()),
      NewGradientStop.create(1, fixture.createColorB()),
    ], "   ");

    expect(sut.name).toBe("gradient");
  });

  it("should reject empty gradient", () => {
    expect(() => NewGradient.create([], "empty")).toThrowError(
      "Gradient must contain at least one stop.",
    );
  });

  it("should reject duplicate positions", () => {
    expect(() => NewGradient.create([
      NewGradientStop.create(0, fixture.createColorA()),
      NewGradientStop.create(0, fixture.createColorB()),
    ], "duplicate")).toThrowError(
      "Gradient stop positions must be unique. Duplicate position '0'.",
    );
  });

  it("should reject invalid index", () => {
    const sut = fixture.createGradient();

    expect(() => sut.getAt(-1)).toThrowError("Gradient stop index '-1' is out of range.");
    expect(() => sut.getAt(3)).toThrowError("Gradient stop index '3' is out of range.");
  });

  it("should return all items as copy", () => {
    const sut = fixture.createGradient();

    const all = sut.getAll();

    expect(all).toHaveLength(3);
    expect(all[0]?.position).toBe(0);
    expect(all[1]?.position).toBe(0.5);
    expect(all[2]?.position).toBe(1);
  });
});
