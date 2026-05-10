import { expect } from 'chai';
import { describe, it } from 'vitest';
import {
  CollisionReferenceKind,
  PolygonCollisionKind,
} from '../../src/index.js';
import { PolygonCollisionFixture } from './PolygonCollisionFixture.js';

describe('PolygonCollisionSystem', () => {
  it('should detect segment intersection between two open polygons', () => {
    const fixture = new PolygonCollisionFixture();

    const source = fixture.openPoly(fixture.line(0, 0, 10, 0));
    const target = fixture.openPoly(fixture.line(5, -5, 5, 5));

    const result = fixture.sut.detect({ source, target });

    expect(result.hasCollide).to.equal(true);
    expect(result.kind).to.equal(PolygonCollisionKind.SegmentIntersection);

    expect(result.details.source).to.have.length(1);
    expect(result.details.target).to.have.length(1);

    const sourceReference = result.details.source[0];
    const targetReference = result.details.target[0];

    expect(sourceReference.index).to.equal(0);
    expect(sourceReference.kind).to.equal(CollisionReferenceKind.Segment);
    expect(sourceReference.position?.equals(fixture.point(5, 0))).to.equal(true);

    expect(targetReference.index).to.equal(0);
    expect(targetReference.kind).to.equal(CollisionReferenceKind.Segment);
    expect(targetReference.position?.equals(fixture.point(5, 0))).to.equal(true);
  });
});