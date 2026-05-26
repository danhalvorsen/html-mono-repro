import { createStepper, type AstarSearchRequest, type GridCoordinate } from "../../../../game-pathfinding-astar/src/index.ts";

export class PathService {
  public findPath(request: AstarSearchRequest): ReadonlyArray<GridCoordinate> {
    const stepper = createStepper(request);

    while (true) {
      const event = stepper.step();
      if (event === null) {
        return [];
      }

      if (event.kind === "path-found" && event.path !== null) {
        return event.path;
      }

      if (event.kind === "no-path") {
        return [];
      }
    }
  }
}
