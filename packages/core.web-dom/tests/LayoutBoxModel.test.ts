// ============================================================================
// FILE: tests/LayoutBoxModel.test.ts
// UPDATE: verify border + use index import
// ============================================================================

import { describe, expect, it } from "vitest";

import {
  LayoutBoxModel,
} from "../src/index.js";

import { LayoutBoxModelFixture } from "./fixtures/LayoutBoxModelFixture.js";

describe("LayoutBoxModel", () => {
  it("should store the provided margin instance", () => {
    const fixture = new LayoutBoxModelFixture();

    expect(fixture.sut.margin).toBe(fixture.margin);
  });

  it("should store the provided padding instance", () => {
    const fixture = new LayoutBoxModelFixture();

    expect(fixture.sut.padding).toBe(fixture.padding);
  });

  it("should store the provided border instance", () => {
    const fixture = new LayoutBoxModelFixture();

    expect(fixture.sut.border).toBe(fixture.border);
  });

  it("should expose all values correctly", () => {
    const fixture = new LayoutBoxModelFixture({
      margin: { top: 1, right: 2, bottom: 3, left: 4 },
      padding: { top: 5, right: 6, bottom: 7, left: 8 },
      border: { top: 9, right: 10, bottom: 11, left: 12 },
    });

    expect(fixture.sut.margin.top).toBe(1);
    expect(fixture.sut.padding.right).toBe(6);
    expect(fixture.sut.border.bottom).toBe(11);
  });
});