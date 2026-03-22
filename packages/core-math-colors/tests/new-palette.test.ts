import { describe, expect, it } from "vitest";
import { NewPalette } from "../src/index.js";
import { NewPaletteFixture } from "./fixtures/NewPaletteFixture.js";
 
describe("NewPalette", () => {
  const fixture = new NewPaletteFixture();

  it("should return correct count", () => {
    const sut = fixture.createPalette();

    expect(sut.count).toBe(3);
  });

  it("should return item by index", () => {
    const sut = fixture.createPalette();

    expect(sut.getAt(0).equals(fixture.createColorA())).toBe(true);
    expect(sut.getAt(1).equals(fixture.createColorB())).toBe(true);
    expect(sut.getAt(2).equals(fixture.createColorC())).toBe(true);
  });

  it("should return all items as copy", () => {
    const sut = fixture.createPalette();

    const all = sut.getAll();

    expect(all).toHaveLength(3);
    expect(all[0]?.equals(fixture.createColorA())).toBe(true);
    expect(all[1]?.equals(fixture.createColorB())).toBe(true);
    expect(all[2]?.equals(fixture.createColorC())).toBe(true);
  });

  it("should reject empty palette", () => {
    expect(() => NewPalette.create([])).toThrowError(
      "Palette must contain at least one sample.",
    );
  });

  it("should reject invalid index", () => {
    const sut = fixture.createPalette();

    expect(() => sut.getAt(-1)).toThrowError("Palette index '-1' is out of range.");
    expect(() => sut.getAt(3)).toThrowError("Palette index '3' is out of range.");
  });
});