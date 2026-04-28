import type { IPathfindingRequest } from "core-graph-pathfinding-domain/src/IPathfindingRequest.js";
import type { IPathfindingResult } from "core-graph-pathfinding-domain/src/IPathfindingResult.js";
import type { IPathNeighbor } from "core-graph-pathfinding-domain/src/IPathNeighbor.js";
import type { IReadOnlyPathGraph } from "core-graph-pathfinding-domain/src/IReadOnlyPathGraph.js";
import { Path } from "core-graph-pathfinding-domain/src/Path.js";
import { PathCostCalculator } from "core-graph-pathfinding-domain/src/PathCostCalculator.js";
import { PathfindingRequest } from "core-graph-pathfinding-domain/src/PathfindingRequest.js";
import { PathfindingResult } from "core-graph-pathfinding-domain/src/PathfindingResult.js";
import { PathNeighbor } from "core-graph-pathfinding-domain/src/PathNeighbor.js";
import { PathReconstructionService } from "core-graph-pathfinding-domain/src/PathReconstructionService.js";
import { ZeroHeuristic } from "core-graph-pathfinding-domain/src/ZeroHeuristic.js";
import { FakePathfindingAlgorithm } from "./FakePathfindingAlgorithm.js";
import { RecordingRequestValidator } from "./RecordingRequestValidator.js";
import { TestPathGraph } from "./TestPathGraph.js";

export class PathfindingDomainFixture {
  public readonly requestValidator: RecordingRequestValidator<string>;
  public readonly pathReconstructionService: PathReconstructionService<string>;
  public readonly pathCostCalculator: PathCostCalculator<string>;
  public readonly zeroHeuristic: ZeroHeuristic<string>;
  public readonly graph: IReadOnlyPathGraph<string>;
  public readonly requestFromAtoC: PathfindingRequest<string>;
  public readonly requestFromAtoA: PathfindingRequest<string>;

  public constructor() {
    this.requestValidator = new RecordingRequestValidator<string>();
    this.pathReconstructionService = new PathReconstructionService<string>();
    this.pathCostCalculator = new PathCostCalculator<string>();
    this.zeroHeuristic = new ZeroHeuristic<string>();

    const neighborsByNodeId = new Map<string, readonly IPathNeighbor<string>[]>([
      [
        "A",
        Object.freeze([
          new PathNeighbor<string>("B", 2),
          new PathNeighbor<string>("C", 5),
        ]),
      ],
      [
        "B",
        Object.freeze([
          new PathNeighbor<string>("C", 3),
        ]),
      ],
      [
        "C",
        Object.freeze([]),
      ],
    ]);

    this.graph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C"]),
      neighborsByNodeId
    );

    this.requestFromAtoC = new PathfindingRequest<string>("A", "C");
    this.requestFromAtoA = new PathfindingRequest<string>("A", "A");
  }

  public createPath(nodes: readonly string[], totalCost: number): Path<string> {
    return new Path<string>(nodes, totalCost);
  }

  public createFoundResult(nodes: readonly string[], totalCost: number): PathfindingResult<string> {
    return PathfindingResult.success(this.createPath(nodes, totalCost));
  }

  public createAlgorithm(
    resultFactory: (
      graph: IReadOnlyPathGraph<string>,
      request: IPathfindingRequest<string>
    ) => IPathfindingResult<string>
  ): FakePathfindingAlgorithm<string> {
    return new FakePathfindingAlgorithm<string>(this.requestValidator, resultFactory);
  }
}
