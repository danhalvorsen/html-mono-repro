import { expect } from "chai";
import { describe, it } from "vitest";
import { PolygonCollisionKind, PolygonCollisionSystemRoot } from "../../src/index.js";
import { PolygonCollisionFixture } from "./PolygonCollisionFixture.js";

describe("Two boxes that are not overlapping should not collide", () => {
  it("should not detect collision between two boxes that are not overlapping", () => {
    const fixture = new PolygonCollisionFixture();
    
    const box1 = fixture.box(0, 0, 10, 10);
    const box2 = fixture.box(11, 0, 10, 10);

    const result = fixture.sut.detect({
      source: fixture.closedPoly(box1),
      target: fixture.closedPoly(box2),
    });

    expect(result.hasCollide).to.equal(false);
    expect(result.kind).to.equal(PolygonCollisionKind.None);
    expect(result.details.count).to.equal(0);
    expect(result.details.hasAny).to.equal(false);
    expect(result.details.source).to.have.length(0);
    expect(result.details.target).to.have.length(0);
  });
});

describe("Two boxes that are overlapping should collide", () => {
  it("should detect all collision points between two boxes that are overlapping", () => {
    const fixture = new PolygonCollisionFixture();

    const box1 = fixture.box(0, 0, 10, 10);
    const box2 = fixture.box(5, 0, 10, 10);

    const result = fixture.sut.detect({
      source: fixture.closedPoly(box1),
      target: fixture.closedPoly(box2),
    });

    expect(result.hasCollide).to.equal(true);
    expect(result.kind).to.equal(PolygonCollisionKind.SegmentIntersection);

    expect(result.details.count).to.equal(4);

    expect(result.details.containsPosition(fixture.point(5, 0))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(10, 0))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(10, 10))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(5, 10))).to.equal(true);

    const first = result.details.firstOrThrow();

    expect(first.source.position?.equals(fixture.point(5, 0))).to.equal(true);
    expect(first.target.position?.equals(fixture.point(5, 0))).to.equal(true);
  });
});