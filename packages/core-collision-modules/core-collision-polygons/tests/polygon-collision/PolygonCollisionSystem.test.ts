import { expect } from "chai";
import { describe, it } from "vitest";
import {
  CollisionReferenceKind,
  PolygonCollisionKind,
} from "../../src/index.js";
import { PolygonCollisionFixture } from "./PolygonCollisionFixture.js";

describe("PolygonCollisionSystem", () => {
  it("should detect segment intersection between two open polygons", () => {
    const fixture = new PolygonCollisionFixture();

    const source = fixture.openPoly(fixture.line(0, 0, 10, 0));
    const target = fixture.openPoly(fixture.line(5, -5, 5, 5));

    const result = fixture.sut.detect({ source, target });

    expect(result.hasCollide).to.equal(true);
    expect(result.kind).to.equal(PolygonCollisionKind.SegmentIntersection);
    expect(result.details.count).to.equal(1);

    const pair = result.details.firstOrThrow();

    expect(pair.source.index).to.equal(0);
    expect(pair.source.kind).to.equal(CollisionReferenceKind.Segment);
    expect(pair.source.position?.equals(fixture.point(5, 0))).to.equal(true);

    expect(pair.target.index).to.equal(0);
    expect(pair.target.kind).to.equal(CollisionReferenceKind.Segment);
    expect(pair.target.position?.equals(fixture.point(5, 0))).to.equal(true);
  });

  it("should detect all collision points between overlapping boxes", () => {
    const fixture = new PolygonCollisionFixture();

    const result = fixture.sut.detect({
      source: fixture.closedPoly(fixture.box(0, 0, 10, 10)),
      target: fixture.closedPoly(fixture.box(5, 0, 10, 10)),
    });

    expect(result.hasCollide).to.equal(true);
    expect(result.kind).to.equal(PolygonCollisionKind.SegmentIntersection);
    expect(result.details.count).to.equal(4);

    expect(result.details.containsPosition(fixture.point(5, 0))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(10, 0))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(10, 10))).to.equal(true);
    expect(result.details.containsPosition(fixture.point(5, 10))).to.equal(true);
  });

  it("should return empty details when polygons do not collide", () => {
    const fixture = new PolygonCollisionFixture();

    const result = fixture.sut.detect({
      source: fixture.openPoly(fixture.line(0, 0, 10, 0)),
      target: fixture.openPoly(fixture.line(0, 10, 10, 10)),
    });

    expect(result.hasCollide).to.equal(false);
    expect(result.kind).to.equal(PolygonCollisionKind.None);
    expect(result.details.count).to.equal(0);
    expect(result.details.hasAny).to.equal(false);
  });

  it("should throw when closed polygon has fewer than three points", () => {
    const fixture = new PolygonCollisionFixture();

    expect(() =>
      fixture.closedPoly([
        fixture.point(0, 0),
        fixture.point(1, 1),
      ])
    ).to.throw(RangeError, "Closed polygon requires at least three points.");
  });
});
