import type { IRectBoundsExpectation } from "./IRectBoundsExpectation";
import type { IRectDimensionsExpectation } from "./IRectDimensionsExpectation";


export class RectExpectationsFixture {
  public static readonly DefaultRectBounds: IRectBoundsExpectation = Object.freeze({
    minX: -0.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 0.5,
    maxZ: 0.5,
  });

  public static readonly DefaultRectDimensions: IRectDimensionsExpectation = Object.freeze({
    width: 1,
    height: 1,
    depth: 1,
  });

  public static readonly Rect10x10x1Bounds: IRectBoundsExpectation = Object.freeze({
    minX: -5,
    minY: -5,
    minZ: -0.5,
    maxX: 5,
    maxY: 5,
    maxZ: 0.5,
  });

  public static readonly Rect10x10x1Dimensions: IRectDimensionsExpectation = Object.freeze({
    width: 10,
    height: 10,
    depth: 1,
  });

  public static readonly TwoRectsOriginAndLeftBounds: IRectBoundsExpectation = Object.freeze({
    minX: -1.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 0.5,
    maxZ: 0.5,
  });

  public static readonly TwoRectsOriginAndRightBounds: IRectBoundsExpectation = Object.freeze({
    minX: -0.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 1.5,
    maxY: 0.5,
    maxZ: 0.5,
  });

  public static readonly TwoRectsOriginAndTopBounds: IRectBoundsExpectation = Object.freeze({
    minX: -0.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 1.5,
    maxZ: 0.5,
  });

  public static readonly TwoRectsOriginAndBottomBounds: IRectBoundsExpectation = Object.freeze({
    minX: -0.5,
    minY: -1.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 0.5,
    maxZ: 0.5,
  });

  public static readonly ElevenRectsOriginAndTenLeftBounds: IRectBoundsExpectation = Object.freeze({
    minX: -10.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 0.5,
    maxZ: 0.5,
  });

  public static readonly FilledTenByTenGridBounds: IRectBoundsExpectation = Object.freeze({
    minX: -10.5,
    minY: -0.5,
    minZ: -0.5,
    maxX: 0.5,
    maxY: 10.5,
    maxZ: 0.5,
  });
}
