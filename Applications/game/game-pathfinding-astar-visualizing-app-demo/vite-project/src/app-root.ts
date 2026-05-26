import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type {
  AstarSearchRequest,
  GridCoordinate,
} from "../../../game-pathfinding-astar/src/index.ts";
import type {
  CellDropEventDetail,
  GridSnapshot,
} from "../../../game-pathfinding-astar-visualizing/src/contracts/AstarVisualizerContracts.ts";
import "../../../game-pathfinding-astar-visualizing/src/components/AstarGridElement.ts";
import "../../../game-pathfinding-astar-visualizing/src/components/AstarToolboxElement.ts";
import { HeuristicService, type HeuristicMode } from "./demo/HeuristicService.ts";
import { SnapshotMapper } from "./demo/SnapshotMapper.ts";
import { PersistenceService } from "./demo/PersistenceService.ts";
import { PathService } from "./demo/PathService.ts";

const ROWS = 10;
const COLS = 14;

@customElement("app-root")
export class AppRoot extends LitElement {
  private readonly fileInputId = "snapshot-file-input";

  private readonly snapshotMapper = new SnapshotMapper();
  private readonly persistenceService = new PersistenceService();
  private readonly pathService = new PathService();

  @state()
  private snapshot: GridSnapshot = this.snapshotMapper.createDemoSnapshot(ROWS, COLS);

  @state()
  private path: ReadonlyArray<GridCoordinate> = [];

  @state()
  private stepIndex = 0;

  @state()
  private heuristic: HeuristicMode = "euclidean";

  @state()
  private message = "";

  @state()
  private totalProcessingMs: number | null = null;

  public constructor() {
    super();
    this.rebuildPath();
  }

  protected render() {
    return html`
      <main>
        <h1>A* Core Demo</h1>
        <div class="controls">
          <button type="button" @click=${this.onStep}>Step</button>
          <button type="button" @click=${this.onRun}>Run</button>
          <button type="button" @click=${this.onReset}>Reset</button>
          <button type="button" @click=${this.onSave}>Save</button>
          <button type="button" @click=${this.onLoad}>Load</button>
          <input
            id=${this.fileInputId}
            type="file"
            accept="application/json"
            @change=${this.onFilePicked}
            hidden
          />
          <label>
            Heuristic
            <select @change=${this.onHeuristicChange} .value=${this.heuristic}>
              <option value="manhattan">manhattan</option>
              <option value="euclidean">euclidean</option>
              <option value="chebyshev">chebyshev</option>
              <option value="octile">octile</option>
            </select>
          </label>
          <span>Step ${this.stepIndex}/${Math.max(this.path.length - 1, 0)}</span>
          <span>
            Total: ${this.totalProcessingMs === null ? "-" : `${this.totalProcessingMs.toFixed(2)} ms`}
          </span>
          <span>${this.message}</span>
        </div>

        <div class="toolbox">
          <span>Drag from menu:</span>
          <astar-toolbox></astar-toolbox>
        </div>

        <p>Click cells to toggle walls. Start/goal are preserved.</p>

        <astar-grid
          .rows=${ROWS}
          .cols=${COLS}
          .cellSize=${28}
          .showCosts=${true}
          .gridSnapshot=${this.snapshot}
          .placementMode=${"wall"}
          @cell-click=${this.onGridCellClick}
          @cell-drop=${this.onGridCellDrop}
        ></astar-grid>
      </main>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: 12px;
      font-family: Arial, sans-serif;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 20px;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    button {
      padding: 4px 10px;
    }

    select {
      margin-left: 4px;
    }

    p {
      margin: 0 0 10px;
    }

    .toolbox {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 10px;
    }
  `;

  private onReset = (): void => {
    this.snapshot = this.snapshotMapper.createDemoSnapshot(ROWS, COLS);
    this.rebuildPath();
    this.message = "";
    this.totalProcessingMs = null;
  };

  private onSave = (): void => {
    const request = this.snapshotToRequest(this.snapshot);
    this.persistenceService.save(request, this.heuristic);
    this.message = "saved";
  };

  private onLoad = (): void => {
    const input = this.renderRoot.querySelector(`#${this.fileInputId}`);
    if (!(input instanceof HTMLInputElement)) {
      this.message = "file input missing";
      return;
    }

    input.value = "";
    input.click();
  };

  private onFilePicked = async (event: Event): Promise<void> => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      this.message = "invalid file input";
      return;
    }

    const file = target.files?.[0];
    if (file === undefined) {
      this.message = "load cancelled";
      return;
    }

    try {
      const text = await file.text();
      const loaded = this.persistenceService.load(text);

      if (loaded.heuristic !== null) {
        this.heuristic = loaded.heuristic;
      }

      this.snapshot = this.snapshotMapper.requestToSnapshot(loaded.request);
      this.rebuildPath();
      this.message = "loaded";
    } catch {
      this.message = "load failed";
    }
  };

  private onHeuristicChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || !HeuristicService.isMode(target.value)) {
      return;
    }

    this.heuristic = target.value;
    this.snapshot = this.snapshotMapper.clearProgress(this.snapshot);
    this.rebuildPath();
  };

  private onGridCellClick = (event: CustomEvent<GridCoordinate>): void => {
    const { row, col } = event.detail;
    this.snapshot = this.snapshotMapper.toggleWall(this.snapshot, row, col);
    this.rebuildPath();
  };

  private onGridCellDrop = (event: CustomEvent<CellDropEventDetail>): void => {
    const { row, col, obstacleType } = event.detail;
    this.snapshot = this.snapshotMapper.applyObstacleType(
      this.snapshot,
      row,
      col,
      obstacleType,
    );
    this.rebuildPath();
    this.message = `dropped ${obstacleType}`;
  };

  private onStep = (): void => {
    if (this.path.length <= 1 || this.stepIndex >= this.path.length - 1) {
      return;
    }

    const nextIndex = this.stepIndex + 1;
    const next = this.path[nextIndex];
    const goal = this.path[this.path.length - 1];
    if (next === undefined || goal === undefined) {
      return;
    }

    const g = nextIndex;
    const terrainCost = this.snapshotMapper.getTraversalCost(this.snapshot, next);
    const h = HeuristicService.distance(this.heuristic, next, goal) * terrainCost;

    this.snapshot = this.snapshotMapper.applyPathStep(this.snapshot, next, g, h);
    this.stepIndex = nextIndex;
  };

  private onRun = (): void => {
    const request = this.snapshotToRequest(this.snapshot);
    const started = performance.now();
    const fullPath = this.pathService.findPath(request);
    const finished = performance.now();

    this.totalProcessingMs = finished - started;
    this.path = fullPath;
    this.stepIndex = Math.max(fullPath.length - 1, 0);

    this.snapshot = this.snapshotMapper.clearProgress(this.snapshot);

    const goal = fullPath[fullPath.length - 1];
    if (goal === undefined) {
      return;
    }

    let nextSnapshot = this.snapshot;
    for (let index = 1; index < fullPath.length; index += 1) {
      const coordinate = fullPath[index];
      if (coordinate === undefined) {
        continue;
      }

      const g = index;
      const terrainCost = this.snapshotMapper.getTraversalCost(nextSnapshot, coordinate);
      const h = HeuristicService.distance(this.heuristic, coordinate, goal) * terrainCost;
      nextSnapshot = this.snapshotMapper.applyPathStep(nextSnapshot, coordinate, g, h);
    }

    this.snapshot = nextSnapshot;
  };

  private rebuildPath(): void {
    const request = this.snapshotToRequest(this.snapshot);
    this.path = this.pathService.findPath(request);
    this.stepIndex = 0;
    this.snapshot = this.snapshotMapper.clearProgress(this.snapshot);
  }

  private snapshotToRequest(snapshot: GridSnapshot): AstarSearchRequest {
    return this.snapshotMapper.snapshotToRequest(snapshot, this.heuristic);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-root": AppRoot;
  }
}
