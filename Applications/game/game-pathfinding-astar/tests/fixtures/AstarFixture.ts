import type {
  AstarSearchRequest,
  AstarSettings,
  GridCoordinate,
} from "../../src/index.js";

export class AstarFixture {
  public createCoordinate(row: number, col: number): GridCoordinate {
    return { row, col };
  }

  public createSettings(overrides?: Partial<AstarSettings>): AstarSettings {
    return {
      heuristic: "manhattan",
      movementMode: "four-way",
      allowCornerCutting: false,
      weight: 1,
      ...overrides,
    };
  }

  public createRequest(overrides?: Partial<AstarSearchRequest>): AstarSearchRequest {
    return {
      rows: 5,
      cols: 5,
      start: this.createCoordinate(0, 0),
      goal: this.createCoordinate(4, 4),
      blocked: new Set<string>(),
      settings: this.createSettings(),
      ...overrides,
    };
  }

  public createBlockedSet(
    coordinates: ReadonlyArray<GridCoordinate>,
  ): ReadonlySet<string> {
    return new Set<string>(
      coordinates.map((coordinate) => `${coordinate.row},${coordinate.col}`),
    );
  }
}
