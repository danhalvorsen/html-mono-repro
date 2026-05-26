import type {
  AstarSearchRequest,
  AstarSettings,
  GridCoordinate,
} from "./contracts/AstarContracts.js";

export interface PersistedAstarRequestV1 {
  readonly schemaVersion: 1;
  readonly rows: number;
  readonly cols: number;
  readonly start: GridCoordinate;
  readonly goal: GridCoordinate;
  readonly blocked: ReadonlyArray<GridCoordinate>;
  readonly settings: AstarSettings;
}

export function serializeRequest(request: AstarSearchRequest): string {
  const blocked: GridCoordinate[] = [];

  for (const key of request.blocked) {
    const [rowText, colText] = key.split(",");
    blocked.push({
      row: Number(rowText),
      col: Number(colText),
    });
  }

  const persisted: PersistedAstarRequestV1 = {
    schemaVersion: 1,
    rows: request.rows,
    cols: request.cols,
    start: request.start,
    goal: request.goal,
    blocked,
    settings: request.settings,
  };

  return JSON.stringify(persisted);
}

export function deserializeRequest(payload: string): AstarSearchRequest {
  const parsed = JSON.parse(payload) as PersistedAstarRequestV1;

  if (parsed.schemaVersion !== 1) {
    throw new Error("Unsupported persisted request schema version.");
  }

  return {
    rows: parsed.rows,
    cols: parsed.cols,
    start: parsed.start,
    goal: parsed.goal,
    blocked: new Set(parsed.blocked.map((coordinate) => `${coordinate.row},${coordinate.col}`)),
    settings: parsed.settings,
  };
}
