import { PolygonCollisionDetails } from "./PolygonCollisionDetails.js";
import {
  CollisionReferenceKind,
  PolygonCollisionKind,
  type CollisionReference,
  type PolygonCollisionQuery,
  type PolygonCollisionResult,
} from "./PolygonCollisionContracts.js";
import { PolygonContainmentAnalyzer } from "./PolygonContainmentAnalyzer.js";
import { PolygonIntersectionAnalyzer } from "./PolygonIntersectionAnalyzer.js";
import { PolygonCollisionValidator } from "./PolygonCollisionValidator.js";
import { PolygonSegmentFactory } from "./PolygonSegmentFactory.js";
import { CollisionReferenceAccumulator } from "./CollisionReferenceAccumulator.js";

export class PolygonCollisionSystem {
  private static readonly defaultTolerance = 1e-9;

  private readonly validator: PolygonCollisionValidator;
  private readonly segmentFactory: PolygonSegmentFactory;
  private readonly intersectionAnalyzer: PolygonIntersectionAnalyzer;
  private readonly containmentAnalyzer: PolygonContainmentAnalyzer;

  public constructor(
    validator: PolygonCollisionValidator = new PolygonCollisionValidator(),
    segmentFactory: PolygonSegmentFactory = new PolygonSegmentFactory(),
    intersectionAnalyzer: PolygonIntersectionAnalyzer = new PolygonIntersectionAnalyzer(),
    containmentAnalyzer?: PolygonContainmentAnalyzer
  ) {
    this.validator = validator;
    this.segmentFactory = segmentFactory;
    this.intersectionAnalyzer = intersectionAnalyzer;
    this.containmentAnalyzer =
      containmentAnalyzer ??
      new PolygonContainmentAnalyzer(segmentFactory, intersectionAnalyzer);
  }

  public detect(query: PolygonCollisionQuery): PolygonCollisionResult {
    const tolerance = query.tolerance ?? PolygonCollisionSystem.defaultTolerance;

    this.validator.validate(query.source, query.target, tolerance);

    const segmentResult = this.detectSegmentIntersection(query, tolerance);

    if (segmentResult.hasCollide) {
      return segmentResult;
    }

    return this.detectContainment(query, tolerance);
  }

  private detectSegmentIntersection(
    query: PolygonCollisionQuery,
    tolerance: number
  ): PolygonCollisionResult {
    const sourceSegments = this.segmentFactory.createSegments(query.source, tolerance);
    const targetSegments = this.segmentFactory.createSegments(query.target, tolerance);
    const accumulator = new CollisionReferenceAccumulator();

    for (const sourceSegment of sourceSegments) {
      for (const targetSegment of targetSegments) {
        if (!this.intersectionAnalyzer.boundsIntersect(
          sourceSegment.bounds,
          targetSegment.bounds,
          tolerance
        )) {
          continue;
        }

        const intersections = this.intersectionAnalyzer.tryIntersectAll(
          sourceSegment.line,
          targetSegment.line,
          tolerance
        );

        for (const intersection of intersections) {
          accumulator.add(
            {
              index: sourceSegment.index,
              position: intersection,
              kind: CollisionReferenceKind.Segment,
            },
            {
              index: targetSegment.index,
              position: intersection,
              kind: CollisionReferenceKind.Segment,
            },
            tolerance
          );
        }
      }
    }

    if (!accumulator.hasAny) {
      return this.none();
    }

    return {
      hasCollide: true,
      kind: PolygonCollisionKind.SegmentIntersection,
      details: accumulator.toDetails(),
    };
  }

  private detectContainment(
    query: PolygonCollisionQuery,
    tolerance: number
  ): PolygonCollisionResult {
    const sourceInsideTarget = this.containmentAnalyzer.findFirstPointInside(
      query.source,
      query.target,
      tolerance
    );

    if (sourceInsideTarget) {
      return this.collision(
        PolygonCollisionKind.SourcePointInsideTarget,
        sourceInsideTarget.innerPoint,
        sourceInsideTarget.outerBoundary
      );
    }

    const targetInsideSource = this.containmentAnalyzer.findFirstPointInside(
      query.target,
      query.source,
      tolerance
    );

    if (targetInsideSource) {
      return this.collision(
        PolygonCollisionKind.TargetPointInsideSource,
        targetInsideSource.outerBoundary,
        targetInsideSource.innerPoint
      );
    }

    return this.none();
  }

  private none(): PolygonCollisionResult {
    return {
      hasCollide: false,
      kind: PolygonCollisionKind.None,
      details: PolygonCollisionDetails.empty(),
    };
  }

  private collision(
    kind: PolygonCollisionKind,
    source: CollisionReference,
    target: CollisionReference
  ): PolygonCollisionResult {
    return {
      hasCollide: true,
      kind,
      details: PolygonCollisionDetails.fromPair(source, target),
    };
  }
}

export {
  CollisionReferenceKind,
  PolygonCollisionKind,
  type CollisionReference,
  type PolygonCollisionQuery,
  type PolygonCollisionResult,
} from "./PolygonCollisionContracts.js";
