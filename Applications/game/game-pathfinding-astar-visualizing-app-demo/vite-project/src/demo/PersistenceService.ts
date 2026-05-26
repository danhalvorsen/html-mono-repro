import {
  deserializeRequest,
  serializeRequest,
  type AstarSearchRequest,
} from "../../../../game-pathfinding-astar/src/index.ts";
import { HeuristicService, type HeuristicMode } from "./HeuristicService.ts";

export interface DemoSavePayload {
  readonly heuristic?: unknown;
  readonly request?: unknown;
}

export class PersistenceService {
  public save(request: AstarSearchRequest, heuristic: HeuristicMode): void {
    const payload = JSON.stringify({
      heuristic,
      request: serializeRequest(request),
    });

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "astar-request.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  public load(payloadText: string): { request: AstarSearchRequest; heuristic: HeuristicMode | null } {
    const parsed = JSON.parse(payloadText) as DemoSavePayload;

    if (typeof parsed.request !== "string") {
      throw new Error("invalid save");
    }

    const request = deserializeRequest(parsed.request);
    const heuristic = HeuristicService.isMode(parsed.heuristic) ? parsed.heuristic : null;

    return { request, heuristic };
  }
}
