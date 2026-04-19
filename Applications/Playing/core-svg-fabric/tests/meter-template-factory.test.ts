import { describe, expect, it, vi } from "vitest";
import { MeterTemplateFactory } from "../src/controls/meter/meter-template-factory.js";
import {
  createMeterModelFixture,
  createRecordingShapeFactory,
} from "./fixtures/meterFixtures.js";

describe("MeterTemplateFactory", () => {
  it("creates track and normalized level rectangles from a meter fixture", () => {
    const { factory, rectangles } = createRecordingShapeFactory();
    const sut = new MeterTemplateFactory(factory);

    sut.create(createMeterModelFixture(), { onWheel: vi.fn() });

    expect(rectangles).toEqual([
      {
        x: 10,
        y: 20,
        width: 40,
        height: 100,
        fill: "#101820",
        stroke: "#304050",
        strokeWidth: 2,
      },
      {
        x: 13,
        y: 48,
        width: 34,
        height: 69,
        fill: "#40c060",
      },
    ]);
  });

  it("rejects invalid ranges instead of rendering misleading output", () => {
    const { factory, rectangles } = createRecordingShapeFactory();
    const sut = new MeterTemplateFactory(factory);

    expect(() =>
      sut.create(
        createMeterModelFixture({
          value: {
            value: 50,
            min: 100,
            max: 0,
          },
        }),
        { onWheel: vi.fn() },
      ),
    ).toThrow(/max must be > min/i);

    expect(rectangles).toHaveLength(0);
  });
});
