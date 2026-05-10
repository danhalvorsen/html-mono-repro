import { expect } from "chai";
import { describe, it } from "vitest";
import {
  PolygonCollisionKind,
  PolygonCollisionSystemRoot,
} from "../../src/index.js";
import { PolygonCollisionFixture } from "./PolygonCollisionFixture.js";

describe("Two parallel lines should not collide", () => {
  it("should not detect collision between two parallel lines", () => {
    const fixture = new PolygonCollisionFixture();
 
    const line1 = fixture.line(0, 0, 10, 0);
    const line2 = fixture.line(0, 1, 10, 1);

    const result = fixture.sut.detect({
      source: fixture.openPoly(line1),
      target: fixture.openPoly(line2),
    });

    expect(result.hasCollide).to.equal(false);
    expect(result.kind).to.equal(PolygonCollisionKind.None);
    expect(result.details.count).to.equal(0);
    expect(result.details.hasAny).to.equal(false);
  });
});

describe("Two intersecting lines should collide", () => {
  it("should detect collision between two intersecting lines", () => {
    const fixture = new PolygonCollisionFixture();
 
    const line1 = fixture.line(0, 0, 10, 10);
    const line2 = fixture.line(0, 10, 10, 0);

    const result = fixture.sut.detect({
      source: fixture.openPoly(line1),
      target: fixture.openPoly(line2),
    });

    expect(result.hasCollide).to.equal(true);
    expect(result.kind).to.equal(PolygonCollisionKind.SegmentIntersection);
    expect(result.details.count).to.equal(1);

    const collision = result.details.firstOrThrow();
    const expectedCollisionPoint = fixture.point(5, 5);

    expect(collision.source.position?.equals(expectedCollisionPoint)).to.equal(true);
    expect(collision.target.position?.equals(expectedCollisionPoint)).to.equal(true);
  });
});