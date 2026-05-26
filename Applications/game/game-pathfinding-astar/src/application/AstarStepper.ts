import type {
  AstarSearchRequest,
  AstarSearchResult,
  AstarStepEvent,
  GridCoordinate,
  IAstarStepper,
} from "../contracts/AstarContracts.js";
import {
  calculateHeuristic,
  createCellKey,
  isWithinBounds,
} from "../domain/GridMath.js";
import {
  DefaultNeighborPolicy,
  isDiagonalMove,
  type INeighborPolicy,
} from "../domain/NeighborPolicy.js";
import { StablePriorityQueue } from "../domain/StablePriorityQueue.js";

interface FrontierEntry {
  readonly coordinate: GridCoordinate;
  readonly gCost: number;
}

export class AstarStepper implements IAstarStepper {
  private readonly request: AstarSearchRequest;
  private readonly neighborPolicy: INeighborPolicy;

  private readonly openQueue = new StablePriorityQueue<FrontierEntry>();
  private readonly cameFrom = new Map<string, GridCoordinate>();
  private readonly gScores = new Map<string, number>();
  private readonly closed = new Set<string>();

  private sequence = 0;
  private initialized = false;
  private finished = false;
  private evaluatedNodes = 0;
  private startedAtMs = 0;

  public constructor(
    request: AstarSearchRequest,
    neighborPolicy: INeighborPolicy = new DefaultNeighborPolicy(),
  ) {
    this.request = request;
    this.neighborPolicy = neighborPolicy;
  }

  public step(): AstarStepEvent | null {
    if (this.finished) {
      return null;
    }

    if (!this.initialized) {
      this.initialize();
      return this.event("started", null, null, null, null);
    }

    if (this.request.abortSignal?.aborted === true) {
      this.finished = true;
      return this.event("no-path", null, null, null, null);
    }

    const maxIterations = this.request.maxIterations;
    if (maxIterations !== undefined && this.evaluatedNodes >= maxIterations) {
      this.finished = true;
      return this.event("no-path", null, null, null, null);
    }

    while (this.openQueue.size > 0) {
      const currentEntry = this.openQueue.dequeue();
      if (currentEntry === null) {
        break;
      }

      const currentKey = createCellKey(currentEntry.coordinate);
      if (this.closed.has(currentKey)) {
        continue;
      }

      const knownG = this.gScores.get(currentKey);
      if (knownG === undefined || currentEntry.gCost > knownG) {
        continue;
      }

      this.closed.add(currentKey);
      this.evaluatedNodes += 1;

      const goalKey = createCellKey(this.request.goal);
      if (currentKey === goalKey) {
        const path = this.reconstructPath(this.request.goal);
        this.finished = true;
        return this.event(
          "path-found",
          currentEntry.coordinate,
          path,
          this.createCosts(currentEntry.coordinate, knownG),
          this.cameFrom.get(currentKey) ?? null,
        );
      }

      const neighbors = this.getNeighbors(currentEntry.coordinate);
      for (const neighbor of neighbors) {
        const neighborKey = createCellKey(neighbor);

        if (this.closed.has(neighborKey)) {
          continue;
        }

        const tentativeG = knownG + this.transitionCost(currentEntry.coordinate, neighbor);
        const existingG = this.gScores.get(neighborKey);

        if (existingG !== undefined && tentativeG >= existingG) {
          continue;
        }

        this.cameFrom.set(neighborKey, currentEntry.coordinate);
        this.gScores.set(neighborKey, tentativeG);

        const h = this.weightedHeuristic(neighbor, this.request.goal);
        const f = tentativeG + h;
        const tieBreaker = this.coordinateTieBreaker(neighbor);

        this.openQueue.enqueue({ coordinate: neighbor, gCost: tentativeG }, f, tieBreaker);
      }

      return this.event(
        "node-closed",
        currentEntry.coordinate,
        null,
        this.createCosts(currentEntry.coordinate, knownG),
        this.cameFrom.get(currentKey) ?? null,
      );
    }

    this.finished = true;
    return this.event("no-path", null, null, null, null);
  }

  public runToCompletion(): AstarSearchResult {
    if (createCellKey(this.request.start) === createCellKey(this.request.goal)) {
      return this.withDiagnostics({
        kind: "path-found",
        path: [this.request.start],
        totalCost: 0,
        evaluatedNodes: 0,
      });
    }

    let finalStep: AstarStepEvent | null = null;

    while (true) {
      const step = this.step();
      if (step === null) {
        break;
      }

      finalStep = step;

      if (step.kind === "path-found" || step.kind === "no-path") {
        break;
      }
    }

    if (finalStep?.kind === "path-found" && finalStep.path !== null) {
      const goalKey = createCellKey(this.request.goal);
      const totalCost = this.gScores.get(goalKey) ?? 0;

      return this.withDiagnostics({
        kind: "path-found",
        path: finalStep.path,
        totalCost,
        evaluatedNodes: this.evaluatedNodes,
      });
    }

    const noPathReason = this.getNoPathReason();

    return this.withDiagnostics({
      kind: "no-path",
      path: null,
      totalCost: null,
      evaluatedNodes: this.evaluatedNodes,
      ...(noPathReason === undefined ? {} : { reason: noPathReason }),
    });
  }

  private initialize(): void {
    this.validateRequest();

    const startKey = createCellKey(this.request.start);
    this.gScores.set(startKey, 0);

    const initialHeuristic = this.weightedHeuristic(this.request.start, this.request.goal);
    this.openQueue.enqueue({ coordinate: this.request.start, gCost: 0 }, initialHeuristic, 0);

    this.startedAtMs = Date.now();
    this.initialized = true;
  }

  private validateRequest(): void {
    if (!Number.isInteger(this.request.rows) || this.request.rows <= 0) {
      throw new Error("Grid rows must be a positive integer.");
    }

    if (!Number.isInteger(this.request.cols) || this.request.cols <= 0) {
      throw new Error("Grid cols must be a positive integer.");
    }

    if (!isWithinBounds(this.request.rows, this.request.cols, this.request.start)) {
      throw new Error("Start coordinate is outside the grid bounds.");
    }

    if (!isWithinBounds(this.request.rows, this.request.cols, this.request.goal)) {
      throw new Error("Goal coordinate is outside the grid bounds.");
    }

    if (!Number.isFinite(this.request.settings.weight) || this.request.settings.weight <= 0) {
      throw new Error("A* weight must be a finite positive number.");
    }

    const startKey = createCellKey(this.request.start);
    const goalKey = createCellKey(this.request.goal);

    if (this.request.blocked.has(startKey) || this.request.blocked.has(goalKey)) {
      throw new Error("Start or goal coordinate is blocked.");
    }

    if (
      this.request.maxIterations !== undefined
      && (!Number.isInteger(this.request.maxIterations) || this.request.maxIterations <= 0)
    ) {
      throw new Error("maxIterations must be a positive integer when provided.");
    }
  }

  private reconstructPath(goal: GridCoordinate): ReadonlyArray<GridCoordinate> {
    const path: GridCoordinate[] = [goal];

    let cursor = goal;
    while (true) {
      const previous = this.cameFrom.get(createCellKey(cursor));
      if (previous === undefined) {
        break;
      }

      path.push(previous);
      cursor = previous;
    }

    return path.reverse();
  }

  private getNeighbors(from: GridCoordinate): ReadonlyArray<GridCoordinate> {
    const neighbors: GridCoordinate[] = [];

    for (const [rowDelta, colDelta] of this.neighborPolicy.getNeighborOffsets(this.request.settings.movementMode)) {
      const candidate: GridCoordinate = {
        row: from.row + rowDelta,
        col: from.col + colDelta,
      };

      if (!isWithinBounds(this.request.rows, this.request.cols, candidate)) {
        continue;
      }

      const candidateKey = createCellKey(candidate);
      if (this.request.blocked.has(candidateKey)) {
        continue;
      }

      if (!this.request.settings.allowCornerCutting && isDiagonalMove(from, candidate)) {
        const sideA: GridCoordinate = { row: from.row + rowDelta, col: from.col };
        const sideB: GridCoordinate = { row: from.row, col: from.col + colDelta };

        if (this.request.blocked.has(createCellKey(sideA)) || this.request.blocked.has(createCellKey(sideB))) {
          continue;
        }
      }

      neighbors.push(candidate);
    }

    return neighbors;
  }

  private weightedHeuristic(from: GridCoordinate, to: GridCoordinate): number {
    return this.request.settings.weight * calculateHeuristic(this.request.settings.heuristic, from, to);
  }

  private transitionCost(from: GridCoordinate, to: GridCoordinate): number {
    const base = isDiagonalMove(from, to) ? Math.SQRT2 : 1;

    if (this.request.traversalCost === undefined) {
      return base;
    }

    const weighted = this.request.traversalCost(to);
    if (!Number.isFinite(weighted) || weighted <= 0) {
      throw new Error("Traversal cost must be a finite positive number.");
    }

    return base * weighted;
  }

  private coordinateTieBreaker(coordinate: GridCoordinate): number {
    return coordinate.row * 1_000_000 + coordinate.col;
  }

  private event(
    kind: AstarStepEvent["kind"],
    coordinate: GridCoordinate | null,
    path: ReadonlyArray<GridCoordinate> | null,
    costs: AstarStepEvent["costs"],
    parent: GridCoordinate | null,
  ): AstarStepEvent {
    this.sequence += 1;

    return {
      sequence: this.sequence,
      kind,
      coordinate,
      current: coordinate,
      costs,
      parent,
      path,
      openSize: this.openQueue.size,
      closedSize: this.closed.size,
      elapsedMs: Date.now() - this.startedAtMs,
    };
  }

  private createCosts(
    coordinate: GridCoordinate,
    g: number,
  ): NonNullable<AstarStepEvent["costs"]> {
    const h = this.weightedHeuristic(coordinate, this.request.goal);

    return {
      g,
      h,
      f: g + h,
    };
  }

  private withDiagnostics<T extends object>(result: T): T {
    Object.defineProperty(result, "diagnostics", {
      value: {
        evaluatedNodes: this.evaluatedNodes,
      },
      enumerable: false,
      configurable: true,
      writable: false,
    });

    return result;
  }

  private getNoPathReason(): "iteration-limit" | "aborted" | undefined {
    if (this.request.abortSignal?.aborted === true) {
      return "aborted";
    }

    const maxIterations = this.request.maxIterations;
    if (maxIterations !== undefined && this.evaluatedNodes >= maxIterations) {
      return "iteration-limit";
    }

    return undefined;
  }
}

export function createStepper(request: AstarSearchRequest): IAstarStepper {
  return new AstarStepper(request);
}
