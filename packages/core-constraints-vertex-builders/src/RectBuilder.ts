import { Direction } from "./Direction.js";
import type { IBuilder } from "./IBuilder.js";
import { RectGeometryService } from "./RectGeometryService.js";
import type { IRectGeometryService } from "./IRectGeometryService.js";
import { RectLayout } from "./RectLayout.js";
import type { IRectPlacementSolver } from "./IRectPlacementSolver.js";
import { RectPlacementSolver } from "./RectPlacementSolver.js";
import { RectState } from "./RectState.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";
import { SemanticSelectorRoot, type IRectBuilderSemanticHost } from "./SemanticSelectorRoot.js";
import type { ISemanticSelectorRoot } from "./ISemanticSelectors.js";

export class RectBuilder implements IBuilder<RectLayout>, IRectBuilderSemanticHost {
  private readonly rects: ReadonlyArray<RectState>;
  private readonly geometryService: IRectGeometryService;
  private readonly placementSolver: IRectPlacementSolver;

  public constructor(
    rects?: ReadonlyArray<RectState>,
    geometryService?: IRectGeometryService,
    placementSolver?: IRectPlacementSolver,
  ) {
    this.rects = Object.freeze([...(rects ?? [])]);
    this.geometryService = geometryService ?? new RectGeometryService();
    this.placementSolver = placementSolver ?? new RectPlacementSolver(this.geometryService);
  }

  public get At(): ISemanticSelectorRoot {
    return new SemanticSelectorRoot(this);
  }

  public Add(width: number = 1, height: number = 1, depth: number = 1): RectBuilder {
    const nextRect = RectState.create({ width, height, depth });

    return new RectBuilder(
      [...this.rects, nextRect],
      this.geometryService,
      this.placementSolver,
    );
  }

  public Left(count: number = 1): RectBuilder {
    return this.place(Direction.Left, count);
  }

  public Right(count: number = 1): RectBuilder {
    return this.place(Direction.Right, count);
  }

  public Top(count: number = 1): RectBuilder {
    return this.place(Direction.Top, count);
  }

  public Bottom(count: number = 1): RectBuilder {
    return this.place(Direction.Bottom, count);
  }

  public Rotate(pivot: RectSemanticPoint, angleDegrees: number): RectBuilder {
    this.assertHasAtLeastOneRect("Rotate requires at least one rect.");

    const rects = [...this.rects];
    const lastRect = rects.at(-1)!;
    rects[rects.length - 1] = lastRect.rotatedAround(pivot, angleDegrees);

    return new RectBuilder(rects, this.geometryService, this.placementSolver);
  }

  public addPointPlacement(point: RectSemanticPoint): RectBuilder {
    if (this.rects.length < 2) {
      throw new Error("Semantic placement requires at least two rectangles.");
    }

    const rects = [...this.rects];
    const previousRect = rects.at(-2)!;
    const currentRect = rects.at(-1)!;
    const transform = this.placementSolver.solve(previousRect, currentRect, point);

    rects[rects.length - 1] = currentRect.movedBy(
      transform.translateX,
      transform.translateY,
      0,
    );

    return new RectBuilder(rects, this.geometryService, this.placementSolver);
  }

  public build(): RectLayout {
    return new RectLayout(this.rects);
  }

  public getRects(): ReadonlyArray<RectState> {
    return this.rects;
  }

  private place(direction: Direction, count: number): RectBuilder {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("count must be an integer greater than zero.");
    }

    this.assertHasAtLeastOneRect(`${Direction[direction]} requires at least one rect.`);

    let builder: RectBuilder = this;
    for (let index = 0; index < count; index += 1) {
      builder = builder.step(direction);
    }

    return builder;
  }

  private step(direction: Direction): RectBuilder {
    const rects = [...this.rects];
    const currentRect = rects.at(-1)!;

    if (currentRect.rotationDegrees !== 0) {
      throw new Error(
        "Directional placement from a rotated rectangle is not supported. Use semantic placement via At.* instead.",
      );
    }

    const nextRect = RectState.create(currentRect.size);
    rects.push(this.resolveAxisAlignedPlacement(currentRect, nextRect, direction));

    return new RectBuilder(rects, this.geometryService, this.placementSolver);
  }

  private resolveAxisAlignedPlacement(current: RectState, next: RectState, direction: Direction): RectState {
    switch (direction) {
      case Direction.Left:
        return next.movedBy(-((current.size.width / 2) + (next.size.width / 2)), 0, 0);
      case Direction.Right:
        return next.movedBy((current.size.width / 2) + (next.size.width / 2), 0, 0);
      case Direction.Top:
        return next.movedBy(0, (current.size.height / 2) + (next.size.height / 2), 0);
      case Direction.Bottom:
        return next.movedBy(0, -((current.size.height / 2) + (next.size.height / 2)), 0);
      default: {
        const exhaustive: never = direction;
        throw new Error(`Unsupported direction: ${String(exhaustive)}`);
      }
    }
  }

  private assertHasAtLeastOneRect(message: string): void {
    if (this.rects.length === 0) {
      throw new Error(message);
    }
  }
}
