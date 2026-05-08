import { describe, expect, it } from "vitest";
import { InputRangeUI } from "../../src/input/input-range.js";

type InputRangeHost = HTMLElement & {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
};

function createSut(): InputRangeHost {
  return new InputRangeUI({
    label: "Scale",
    min: 0,
    max: 100,
    value: 50,
    step: 5,
  }).createElement() as InputRangeHost;
}

describe("InputRangeUI", () => {
  it("creates ui-input-range host element", () => {
    const element = createSut();

    expect(element.tagName.toLowerCase()).toBe("ui-input-range");
  });

  it("sets host properties", () => {
    const element = createSut();

    expect(element.label).toBe("Scale");
    expect(element.min).toBe(0);
    expect(element.max).toBe(100);
    expect(element.value).toBe(50);
    expect(element.step).toBe(5);
  });

  it("uses default step when step is omitted", () => {
    const element = new InputRangeUI({
      label: "Scale",
      min: 0,
      max: 100,
      value: 50,
    }).createElement() as InputRangeHost;

    expect(element.step).toBe(1);
  });

  it("clamps initial value to max", () => {
    const element = new InputRangeUI({
      label: "Scale",
      min: 0,
      max: 100,
      value: 150,
    }).createElement() as InputRangeHost;

    expect(element.value).toBe(100);
  });

  it("clamps initial value to min", () => {
    const element = new InputRangeUI({
      label: "Scale",
      min: 0,
      max: 100,
      value: -10,
    }).createElement() as InputRangeHost;

    expect(element.value).toBe(0);
  });

  it("throws when max is not greater than min", () => {
    expect(() => {
      new InputRangeUI({
        label: "Scale",
        min: 100,
        max: 0,
        value: 50,
      });
    }).toThrow(/max must be greater than min/i);
  });

  it("throws when step is invalid", () => {
    expect(() => {
      new InputRangeUI({
        label: "Scale",
        min: 0,
        max: 100,
        value: 50,
        step: 0,
      });
    }).toThrow(/step must be finite and greater than zero/i);
  });
});
