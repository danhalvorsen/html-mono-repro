import { LitElement, css, html, type PropertyValues } from "lit";
import type {
  AstarEngineStepEvent,
  AstarSettings,
  AstarStats,
  AstarStatus,
  CellClickEventDetail,
  CellDropEventDetail,
  CellDragEventDetail,
  CellState,
  GridChangedEventDetail,
  GridCoordinate,
  GridLoadedEventDetail,
  GridSnapshot,
  PlacementMode,
  PersistedGridDocument,
  PlacementModeChangeEventDetail,
  ResetEventDetail,
  SettingsChangeEventDetail,
  SpeedChangeEventDetail,
} from "../contracts/AstarVisualizerContracts.js";
import {
  AstarDomEventNames,
  createDefaultSettings,
  createEmptyCellState,
  createEmptyGridSnapshot,
  createIdleStats,
} from "../contracts/AstarVisualizerContracts.js";
import { dispatchAstarEvent } from "../events/dispatchAstarEvent.js";
import {
  exportGridDocument,
  importGridDocument,
} from "../persistence/GridDocumentPersistence.js";
import { AstarPlaybackController } from "../controllers/AstarPlaybackController.js";
import { AstarProjectionController } from "../controllers/AstarProjectionController.js";
import { AstarSettingsController, type AstarSettingsValidationResult } from "../controllers/AstarSettingsController.js";
import { AstarStatsController } from "../controllers/AstarStatsController.js";
import { DefaultPlacementPolicy } from "../policies/DefaultPlacementPolicy.js";
import type { IPlacementPolicy } from "../policies/IPlacementPolicy.js";
import type { IAstarEnginePort } from "../ports/IAstarEnginePort.js";
import "./AstarControlsElement.js";
import "./AstarGridElement.js";
import "./AstarSettingsElement.js";
import "./AstarStatsElement.js";

export class AstarVisualizerElement extends LitElement {
  public static override readonly properties = {
    enginePort: { attribute: false },
    rows: { type: Number },
    cols: { type: Number },
    cellSize: { type: Number, attribute: "cell-size" },
    showCosts: { type: Boolean, attribute: "show-costs" },
    millisecondsPerStep: {
      type: Number,
      attribute: "milliseconds-per-step",
    },
    gridSnapshot: { attribute: false, state: true },
    stats: { attribute: false, state: true },
    placementMode: { type: String, state: true },
    settings: { attribute: false, state: true },
    settingsError: { type: String, state: true },
  };

  public static override readonly styles = css`
    :host {
      display: block;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    .layout {
      display: grid;
      gap: 1rem;
    }

    .top {
      display: grid;
      gap: 0.75rem;
    }

    .error {
      color: #cf222e;
      font-weight: 700;
    }
  `;

  private readonly playbackController: AstarPlaybackController;
  private readonly projectionController: AstarProjectionController;
  private readonly settingsController: AstarSettingsController;
  private readonly statsController: AstarStatsController;
  private readonly placementPolicy: IPlacementPolicy;

  public declare enginePort: IAstarEnginePort | null;
  public declare rows: number;
  public declare cols: number;
  public declare cellSize: number;
  public declare showCosts: boolean;
  public declare millisecondsPerStep: number;
  public declare gridSnapshot: GridSnapshot;
  public declare stats: AstarStats;
  public declare placementMode: PlacementMode;
  public declare settings: AstarSettings;
  public declare settingsError: string | null;

  public constructor() {
    super();

    this.enginePort = null;
    this.rows = 10;
    this.cols = 10;
    this.cellSize = 24;
    this.showCosts = false;
    this.millisecondsPerStep = 50;
    this.gridSnapshot = createEmptyGridSnapshot(10, 10);
    this.stats = createIdleStats();
    this.placementMode = "wall";
    this.settings = createDefaultSettings();
    this.settingsError = null;

    this.placementPolicy = new DefaultPlacementPolicy();
    this.statsController = new AstarStatsController(this);
    this.projectionController = new AstarProjectionController(this);
    this.settingsController = new AstarSettingsController(this);
    this.playbackController = new AstarPlaybackController(this);
  }

  public override connectedCallback(): void {
    super.connectedCallback();

    if (this.gridSnapshot.length === 0) {
      this.initializeSnapshot();
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("enginePort")) {
      this.playbackController.setEnginePort(this.enginePort);
      this.settingsController.setEnginePort(this.enginePort);

      this.enginePort?.configure(this.settings);
      this.enginePort?.reset(this.gridSnapshot);
    }

    if (changed.has("rows") || changed.has("cols")) {
      this.initializeSnapshot();
    }
  }

  public setGridSnapshot(snapshot: GridSnapshot): void {
    this.gridSnapshot = snapshot;
  }

  public setSettings(settings: AstarSettings): void {
    this.settings = settings;
    this.settingsError = null;
  }

  public rejectSettingsChange(result: AstarSettingsValidationResult): void {
    this.settingsError = result.errorMessage;
  }

  public setStatus(status: AstarStatus): void {
    this.stats = {
      ...this.stats,
      status,
    };
  }

  public applyEngineStep(step: AstarEngineStepEvent): void {
    this.projectionController.applyStep(step);
    this.stats = this.statsController.calculate(step, this.stats);
  }

  protected override render() {
    return html`
      <section class="layout" aria-label="A star visualizer">
        <div class="top">
          <astar-controls
            .status=${this.stats.status}
            .millisecondsPerStep=${this.millisecondsPerStep}
            .placementMode=${this.placementMode}
            @start=${this.handleStart}
            @pause=${this.handlePause}
            @step=${this.handleStep}
            @reset=${this.handleReset}
            @speed-change=${this.handleSpeedChange}
            @placement-mode-change=${this.handlePlacementModeChange}
          ></astar-controls>

          <astar-settings
            .settings=${this.settings}
            .disabled=${this.stats.status === "running"}
            @settings-change=${this.handleSettingsChange}
          ></astar-settings>

          ${this.settingsError === null
            ? html``
            : html`<p class="error" role="alert">${this.settingsError}</p>`}

          <astar-stats .stats=${this.stats}></astar-stats>
        </div>

        <astar-grid
          .rows=${this.rows}
          .cols=${this.cols}
          .cellSize=${this.cellSize}
          .showCosts=${this.showCosts}
          .gridSnapshot=${this.gridSnapshot}
          .placementMode=${this.placementMode}
          @cell-click=${this.handleCellClick}
          @cell-drag=${this.handleCellDrag}
          @cell-drop=${this.handleCellDrop}
        ></astar-grid>
      </section>
    `;
  }

  public exportGridDocument(): PersistedGridDocument {
    return exportGridDocument(this.gridSnapshot);
  }

  public importGridDocument(document: PersistedGridDocument): void {
    const snapshot = importGridDocument(document);
    this.applyLoadedGridDimensions(document.rows, document.cols);
    this.setGridSnapshot(snapshot);
    this.stats = createIdleStats();
    this.enginePort?.reset(snapshot);
    this.emitGridLoaded({ document, snapshot });
    this.emitGridChanged({ snapshot });
  }

  public applyLoadedGridDimensions(rows: number, cols: number): void {
    this.rows = rows;
    this.cols = cols;
  }

  public emitGridLoaded(detail: GridLoadedEventDetail): void {
    dispatchAstarEvent(this, AstarDomEventNames.GridLoaded, detail);
  }

  public emitGridChanged(detail: GridChangedEventDetail): void {
    dispatchAstarEvent(this, AstarDomEventNames.GridChanged, detail);
  }

  public applyObstacleMetadata(): void {
    // Reserved hook for obstacle metadata enrichment from persisted documents.
  }

  private handleStart = (): void => {
    this.playbackController.play();
  };

  private handlePause = (): void => {
    this.playbackController.pause();
  };

  private handleStep = (): void => {
    this.playbackController.step();
  };

  private handleReset = (event: CustomEvent<ResetEventDetail>): void => {
    const snapshot = this.createResetSnapshot(event.detail);

    this.projectionController.reset(snapshot);
    this.stats = createIdleStats();
    this.playbackController.reset(snapshot);
  };

  private handleSpeedChange = (
    event: CustomEvent<SpeedChangeEventDetail>,
  ): void => {
    this.millisecondsPerStep = event.detail.millisecondsPerStep;
    this.playbackController.setMillisecondsPerStep();
  };

  private handlePlacementModeChange = (
    event: CustomEvent<PlacementModeChangeEventDetail>,
  ): void => {
    this.placementMode = event.detail.mode;
  };

  private handleSettingsChange = (
    event: CustomEvent<SettingsChangeEventDetail>,
  ): void => {
    this.settingsController.applySettings(event.detail.settings);
  };

  private handleCellClick = (event: CustomEvent<CellClickEventDetail>): void => {
    this.applyPlacement(event.detail);
  };

  private handleCellDrag = (event: CustomEvent<CellDragEventDetail>): void => {
    if (event.detail.phase === "end") {
      return;
    }

    if (this.placementMode !== "wall" && this.placementMode !== "erase") {
      return;
    }

    this.applyPlacement(event.detail);
  };

  private handleCellDrop = (event: CustomEvent<CellDropEventDetail>): void => {
    const mode: PlacementMode = event.detail.obstacleType === "wall" ? "wall" : "erase";

    this.applyPlacement({ row: event.detail.row, col: event.detail.col }, mode);
  };

  private applyPlacement(coordinate: GridCoordinate, overrideMode?: PlacementMode): void {
    const mode = overrideMode ?? this.placementMode;

    if (
      !this.placementPolicy.canPlace(
        coordinate,
        mode,
        this.gridSnapshot,
      )
    ) {
      return;
    }

    const nextSnapshot = this.createSnapshotWithPlacement(
      coordinate,
      mode,
    );

    this.setGridSnapshot(nextSnapshot);
    this.stats = createIdleStats();
    this.enginePort?.reset(nextSnapshot);
    this.emitGridChanged({ snapshot: nextSnapshot });
  }

  private createSnapshotWithPlacement(
    coordinate: GridCoordinate,
    mode: PlacementMode,
  ): GridSnapshot {
    return this.gridSnapshot.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const isTarget =
          rowIndex === coordinate.row && colIndex === coordinate.col;

        if (mode === "start" && cell.role === "start") {
          return createEmptyCellState();
        }

        if (mode === "goal" && cell.role === "goal") {
          return createEmptyCellState();
        }

        if (!isTarget) {
          return this.clearRuntimeState(cell);
        }

        return this.createPlacedCell(mode);
      }),
    );
  }

  private createPlacedCell(mode: PlacementMode): CellState {
    if (mode === "erase") {
      return createEmptyCellState();
    }

    return {
      ...createEmptyCellState(),
      role: mode,
    };
  }

  private clearRuntimeState(cell: CellState): CellState {
    return {
      role: cell.role,
      visitState: "unvisited",
      g: null,
      h: null,
      f: null,
      parentDirection: null,
    };
  }

  private createResetSnapshot(detail: ResetEventDetail): GridSnapshot {
    return this.gridSnapshot.map((row) =>
      row.map((cell) => {
        const shouldPreserveWall = detail.preserveWalls && cell.role === "wall";
        const shouldPreserveEndpoint =
          detail.preserveStartAndGoal &&
          (cell.role === "start" || cell.role === "goal");

        if (shouldPreserveWall || shouldPreserveEndpoint) {
          return {
            ...createEmptyCellState(),
            role: cell.role,
          };
        }

        return createEmptyCellState();
      }),
    );
  }

  private initializeSnapshot(): void {
    const snapshot = createEmptyGridSnapshot(this.rows, this.cols);

    this.gridSnapshot = snapshot;
    this.stats = createIdleStats();
    this.enginePort?.reset(snapshot);
  }
}

if (!customElements.get("astar-visualizer")) {
  customElements.define("astar-visualizer", AstarVisualizerElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-visualizer": AstarVisualizerElement;
  }
}
