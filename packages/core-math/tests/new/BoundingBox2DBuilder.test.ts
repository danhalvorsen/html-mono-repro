// packages/core-math/tests/implementations/BoundingBox2DBuilder.test.ts

import { describe, it } from "vitest";
import { expect } from "chai";

import { Vector2 } from "../../src/implementations/Vector2.js";
import { BoundingBox2DBuilder } from "../../src/implementations/BoundingBox2DBuilder.js";

describe("BoundingBox2DBuilder", () => {
  it("build() on empty builder returns a neutral 0,0 bbox", () => {
    const bbox = new BoundingBox2DBuilder().build();

    expect(bbox.minX).to.equal(0);
    expect(bbox.minY).to.equal(0);
    expect(bbox.maxX).to.equal(0);
    expect(bbox.maxY).to.equal(0);
    expect(bbox.width()).to.equal(0);
    expect(bbox.height()).to.equal(0);
  });

  it("add() expands min/max correctly for a single point", () => {
    const bbox = new BoundingBox2DBuilder()
      .add(new Vector2(5, 7))
      .build();

    expect(bbox.minX).to.equal(5);
    expect(bbox.minY).to.equal(7);
    expect(bbox.maxX).to.equal(5);
    expect(bbox.maxY).to.equal(7);
  });

  it("addMany() computes bbox for multiple points (unordered)", () => {
    const points = [
      new Vector2(10, 20),
      new Vector2(-3, 5),
      new Vector2(7, -8),
      new Vector2(0, 0),
    ] as const;

    const bbox = new BoundingBox2DBuilder()
      .addMany(points)
      .build();

    expect(bbox.minX).to.equal(-3);
    expect(bbox.minY).to.equal(-8);
    expect(bbox.maxX).to.equal(10);
    expect(bbox.maxY).to.equal(20);
    expect(bbox.width()).to.equal(13);
    expect(bbox.height()).to.equal(28);
  });

  it("supports incremental building: addMany + add", () => {
    const bbox = new BoundingBox2DBuilder()
      .addMany([new Vector2(1, 1), new Vector2(2, 2)])
      .add(new Vector2(-5, 10))
      .build();

    expect(bbox.minX).to.equal(-5);
    expect(bbox.minY).to.equal(1);
    expect(bbox.maxX).to.equal(2);
    expect(bbox.maxY).to.equal(10);
  });

  it("build() returns a snapshot (later adds do not mutate previous bbox)", () => {
    const builder = new BoundingBox2DBuilder()
      .addMany([new Vector2(0, 0), new Vector2(1, 1)]);

    const bbox1 = builder.build();
    builder.add(new Vector2(10, -10));
    const bbox2 = builder.build();

    expect(bbox1.minX).to.equal(0);
    expect(bbox1.minY).to.equal(0);
    expect(bbox1.maxX).to.equal(1);
    expect(bbox1.maxY).to.equal(1);

    expect(bbox2.minX).to.equal(0);
    expect(bbox2.minY).to.equal(-10);
    expect(bbox2.maxX).to.equal(10);
    expect(bbox2.maxY).to.equal(1);
  });
});
