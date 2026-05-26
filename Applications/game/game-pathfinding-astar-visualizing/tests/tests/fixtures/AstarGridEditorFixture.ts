import type { GridSnapshot } from "../../../contracts/AstarVisualizerContracts";
import { createEmptyGridSnapshot, createIdleStats } from "../../../contracts/AstarVisualizerContracts";
import type {
  AstarGridDocument,
  ObstacleMetadata,
  PlacedObstacle,
} from "../../AstarGridEditorContracts";

export interface EngineResetCall {
  readonly snapshot: GridSnapshot;
}

export class FakeAstarEnginePort {
  public readonly resetCalls: EngineResetCall[] = [];

  public configure(): void {
    return;
  }

  public next(): null {
    return null;
  }

  public reset(snapshot: GridSnapshot): void {
    this.resetCalls.push({ snapshot });
  }
}

export class AstarGridEditorFixture {
  public createValidDocument(): AstarGridDocument {
    return {
      schemaVersion: 1,
      rows: 4,
      cols: 4,
      start: { row: 0, col: 0 },
      goal: { row: 3, col: 3 },
      walls: [{ row: 1, col: 1 }],
      obstacles: [
        {
          id: "slow-zone-1",
          obstacleType: "slow-zone",
          origin: { row: 2, col: 1 },
          cells: [{ row: 2, col: 1 }],
          metadata: {
            movementCost: 5,
            blocksMovement: false,
            label: "Mud",
          },
        },
      ],
    };
  }

  public createDocumentWithoutObstacles(): AstarGridDocument {
    return {
      schemaVersion: 1,
      rows: 4,
      cols: 4,
      start: { row: 0, col: 0 },
      goal: { row: 3, col: 3 },
      walls: [],
      obstacles: [],
    };
  }

  public createObstacle(
    id = "wall-obstacle-1",
    row = 1,
    col = 2,
  ): PlacedObstacle {
    return {
      id,
      obstacleType: "wall",
      origin: { row, col },
      cells: [{ row, col }],
      metadata: {
        blocksMovement: true,
      },
    };
  }

  public createWeightedMetadata(): ObstacleMetadata {
    return {
      weight: 4,
      movementCost: 4,
      blocksMovement: false,
      label: "Heavy terrain",
    };
  }

  public createEmptySnapshot(rows = 4, cols = 4): GridSnapshot {
    return createEmptyGridSnapshot(rows, cols);
  }

  public createFakeEnginePort(): FakeAstarEnginePort {
    return new FakeAstarEnginePort();
  }

  public createRunningStats() {
    return {
      ...createIdleStats(),
      evaluatedNodes: 5,
      openSize: 3,
      closedSize: 2,
      pathLength: 4,
      elapsedMs: 17,
      status: "running" as const,
    };
  }
}
