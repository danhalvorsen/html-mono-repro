import { BoxCompositionRoot } from "@monorepo/core-math-rectangle";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import {
  type IPlacementCandidate,
  type IPlacementZone,
  type IRectangleKind,
} from "@monorepo/core-rectangle-placement";

export interface IControlledBoxGridLayout {
  createPlacements(configuration: IControlledBoxGridConfiguration): readonly IControlledBoxPlacement[];
}

export interface IControlledBoxGridConfiguration {
  readonly playgroundWidth: number;
  readonly playgroundDepth: number;
  readonly columns: number;
  readonly rows: number;
  readonly boxHeight: number;
  readonly boxInsetRatio: number;
  readonly baseTopY: number;
}

export interface IControlledBoxPlacement {
  readonly name: string;
  readonly boxHeight: number;
  readonly candidate: IPlacementCandidate;
  readonly zone: IPlacementZone;
}

export class ControlledBoxGridLayout implements IControlledBoxGridLayout {
  private static readonly GridBoxKind: IRectangleKind = Object.freeze({
    value: "controlled-grid-box",
  });

  private readonly boxModule = new BoxCompositionRoot();

  public createPlacements(
    configuration: IControlledBoxGridConfiguration,
  ): readonly IControlledBoxPlacement[] {
    this.validate(configuration);

    const cellWidth = configuration.playgroundWidth / configuration.columns;
    const cellDepth = configuration.playgroundDepth / configuration.rows;

    const boxWidth = cellWidth * (1 - configuration.boxInsetRatio);
    const boxDepth = cellDepth * (1 - configuration.boxInsetRatio);

    const left = -(configuration.playgroundWidth * 0.5);
    const front = -(configuration.playgroundDepth * 0.5);
    const placements: IControlledBoxPlacement[] = [];

    for (let row = 0; row < configuration.rows; row += 1) {
      for (let column = 0; column < configuration.columns; column += 1) {
        const minX = left + (cellWidth * column) + (cellWidth * configuration.boxInsetRatio * 0.5);
        const maxX = minX + boxWidth;
        const minY = front + (cellDepth * row) + (cellDepth * configuration.boxInsetRatio * 0.5);
        const maxY = minY + boxDepth;

        const bounds = this.boxModule.createAabb2(
          new Vector2Gpu(minX, minY),
          new Vector2Gpu(maxX, maxY),
        );

        const candidate: IPlacementCandidate = {
          kind: ControlledBoxGridLayout.GridBoxKind,
          bounds,
        };

        const zone: IPlacementZone = {
          id: { value: `controlled-zone-${row}-${column}` },
          bounds,
          allowedKinds: [ControlledBoxGridLayout.GridBoxKind],
        };

        placements.push({
          name: `controlled-box-${row}-${column}`,
          boxHeight: configuration.boxHeight,
          candidate,
          zone,
        });
      }
    }

    return placements;
  }

  private validate(configuration: IControlledBoxGridConfiguration): void {
    this.assertPositive(configuration.playgroundWidth, "playgroundWidth");
    this.assertPositive(configuration.playgroundDepth, "playgroundDepth");
    this.assertPositive(configuration.boxHeight, "boxHeight");

    if (!Number.isInteger(configuration.columns) || configuration.columns <= 0) {
      throw new Error("columns must be a positive integer.");
    }

    if (!Number.isInteger(configuration.rows) || configuration.rows <= 0) {
      throw new Error("rows must be a positive integer.");
    }

    if (!Number.isFinite(configuration.baseTopY)) {
      throw new Error("baseTopY must be finite.");
    }

    if (
      !Number.isFinite(configuration.boxInsetRatio) ||
      configuration.boxInsetRatio < 0 ||
      configuration.boxInsetRatio >= 1
    ) {
      throw new Error("boxInsetRatio must be >= 0 and < 1.");
    }
  }

  private assertPositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be > 0.`);
    }
  }
}
