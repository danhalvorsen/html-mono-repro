Correct. Add a **contract section** before the Gherkin scenarios.

```ts
// astar-visualizer.contracts.ts

export type GridRow = number;
export type GridCol = number;

export interface GridCoordinate {
  readonly row: GridRow;
  readonly col: GridCol;
}

export type CellRole =
  | "empty"
  | "start"
  | "goal"
  | "wall";

export type CellVisitState =
  | "unvisited"
  | "open"
  | "closed"
  | "current"
  | "path";

export type ParentDirection =
  | "north"
  | "north-east"
  | "east"
  | "south-east"
  | "south"
  | "south-west"
  | "west"
  | "north-west";

export interface CellState {
  readonly role: CellRole;
  readonly visitState: CellVisitState;
  readonly g: number | null;
  readonly h: number | null;
  readonly f: number | null;
  readonly parentDirection: ParentDirection | null;
}

export type GridSnapshot = ReadonlyArray<ReadonlyArray<CellState>>;

export interface GridCellPatch {
  readonly row: GridRow;
  readonly col: GridCol;

  /**
   * Undefined means unchanged.
   * Null is only allowed on nullable fields.
   */
  readonly role?: CellRole;
  readonly visitState?: CellVisitState;
  readonly g?: number | null;
  readonly h?: number | null;
  readonly f?: number | null;
  readonly parentDirection?: ParentDirection | null;
}

export type GridDiff = ReadonlyArray<GridCellPatch>;

export type PlacementMode =
  | "start"
  | "goal"
  | "wall"
  | "erase";

export type DragPhase =
  | "start"
  | "move"
  | "end";

export type AstarStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface AstarStats {
  readonly evaluatedNodes: number;
  readonly openSize: number;
  readonly closedSize: number;
  readonly pathLength: number | null;
  readonly elapsedMs: number;
  readonly status: AstarStatus;
}

export type AstarHeuristic =
  | "manhattan"
  | "euclidean"
  | "octile"
  | "chebyshev";

export type AstarMovementMode =
  | "four-way"
  | "eight-way";

export interface AstarSettings {
  readonly heuristic: AstarHeuristic;
  readonly movementMode: AstarMovementMode;
  readonly allowCornerCutting: boolean;
  readonly weight: number;
}

export type AstarEngineStepKind =
  | "started"
  | "node-opened"
  | "node-closed"
  | "cost-updated"
  | "path-found"
  | "no-path";

export interface AstarCosts {
  readonly g: number;
  readonly h: number;
  readonly f: number;
}

export interface AstarEngineStepEvent {
  readonly sequence: number;
  readonly kind: AstarEngineStepKind;

  /**
   * The primary node affected by this step.
   * Null for global steps such as "started" or "no-path".
   */
  readonly coordinate: GridCoordinate | null;

  /**
   * The current node being evaluated.
   */
  readonly current: GridCoordinate | null;

  /**
   * Null when this step does not change costs.
   */
  readonly costs: AstarCosts | null;

  /**
   * Null when this step does not update parent linkage.
   */
  readonly parent: GridCoordinate | null;

  /**
   * Only populated when kind === "path-found".
   */
  readonly path: ReadonlyArray<GridCoordinate> | null;

  readonly evaluatedNodes: number;
  readonly openSize: number;
  readonly closedSize: number;
  readonly elapsedMs: number;
}

export const AstarDomEventNames = {
  CellClick: "cell-click",
  CellDrag: "cell-drag",

  Start: "start",
  Pause: "pause",
  Step: "step",
  Reset: "reset",
  SpeedChange: "speed-change",
  PlacementModeChange: "placement-mode-change",

  SettingsChange: "settings-change",
} as const;

export interface CellClickEventDetail {
  readonly row: GridRow;
  readonly col: GridCol;
}

export interface CellDragEventDetail {
  readonly row: GridRow;
  readonly col: GridCol;
  readonly phase: DragPhase;
}

export interface SpeedChangeEventDetail {
  readonly millisecondsPerStep: number;
}

export interface PlacementModeChangeEventDetail {
  readonly mode: PlacementMode;
}

export interface SettingsChangeEventDetail {
  readonly settings: AstarSettings;
}

export interface ResetEventDetail {
  readonly preserveWalls: boolean;
  readonly preserveStartAndGoal: boolean;
}

export interface AstarVisualizerEventMap {
  readonly "cell-click": CellClickEventDetail;
  readonly "cell-drag": CellDragEventDetail;

  readonly "start": Record<string, never>;
  readonly "pause": Record<string, never>;
  readonly "step": Record<string, never>;
  readonly "reset": ResetEventDetail;
  readonly "speed-change": SpeedChangeEventDetail;
  readonly "placement-mode-change": PlacementModeChangeEventDetail;

  readonly "settings-change": SettingsChangeEventDetail;
}
```

One cleanup: remove `cell-mode-change` unless it has a distinct purpose. `placement-mode-change` already owns mode changes. The grid should emit coordinates only.

Add this Gherkin section before the behavioral scenarios:

```gherkin
Feature: A* visualizer structural contracts

  The A* visualizer shall define the minimal shared contracts required for
  deterministic rendering, playback, projection, and testing.

  Scenario: Define grid cell state
    Given a cell is represented by CellState
    Then the cell shall have exactly one role
    And the role shall be empty, start, goal, or wall
    And the cell shall have exactly one visit state
    And the visit state shall be unvisited, open, closed, current, or path
    And g, h, and f costs shall be numbers or null
    And parentDirection shall be a direction or null

  Scenario: Define immutable grid snapshots
    Given a GridSnapshot is provided to <astar-grid>
    Then it shall be a readonly two-dimensional collection of CellState values
    And the first dimension shall represent rows
    And the second dimension shall represent columns
    And consumers shall not mutate the snapshot directly

  Scenario: Define grid diffs
    Given a GridDiff is produced by the projection layer
    Then each patch shall contain a row and column
    And each patch may contain role, visitState, g, h, f, or parentDirection updates
    And missing fields shall mean unchanged
    And nullable fields set to null shall clear their value
    And patches shall be applied in order
    And if multiple patches target the same cell, the last patch shall win

  Scenario: Emit cell click events
    Given the user clicks a grid cell
    When <astar-grid> emits cell-click
    Then the event detail shall contain row
    And the event detail shall contain col
    And the event detail shall contain no algorithm state

  Scenario: Emit cell drag events
    Given the user drags across the grid
    When <astar-grid> emits cell-drag
    Then the event detail shall contain row
    And the event detail shall contain col
    And the event detail shall contain phase
    And phase shall be start, move, or end

  Scenario: Emit playback control events
    Given the user interacts with <astar-controls>
    When the user presses play
    Then <astar-controls> shall emit start with an empty detail object
    When the user presses pause
    Then <astar-controls> shall emit pause with an empty detail object
    When the user presses step
    Then <astar-controls> shall emit step with an empty detail object

  Scenario: Emit reset events
    Given the user resets the visualization
    When <astar-controls> emits reset
    Then the event detail shall contain preserveWalls
    And the event detail shall contain preserveStartAndGoal

  Scenario: Emit speed change events
    Given the user changes playback speed
    When <astar-controls> emits speed-change
    Then the event detail shall contain millisecondsPerStep
    And millisecondsPerStep shall be greater than zero

  Scenario: Emit placement mode change events
    Given the user selects a placement mode
    When <astar-controls> emits placement-mode-change
    Then the event detail shall contain mode
    And mode shall be start, goal, wall, or erase

  Scenario: Emit settings change events
    Given the user changes algorithm settings
    When <astar-settings> emits settings-change
    Then the event detail shall contain settings
    And settings shall contain heuristic
    And settings shall contain movementMode
    And settings shall contain allowCornerCutting
    And settings shall contain weight

  Scenario: Define engine step events
    Given the A* engine advances by one deterministic step
    When the engine emits an AstarEngineStepEvent
    Then the event shall contain sequence
    And the event shall contain kind
    And the event shall contain coordinate
    And the event shall contain current
    And the event shall contain costs
    And the event shall contain parent
    And the event shall contain path
    And the event shall contain evaluatedNodes
    And the event shall contain openSize
    And the event shall contain closedSize
    And the event shall contain elapsedMs

  Scenario: Mark successful completion
    Given the engine finds a path
    When it emits an engine step event
    Then kind shall be path-found
    And path shall contain the ordered coordinates from start to goal
    And coordinate may be null

  Scenario: Mark failed completion
    Given the engine exhausts all reachable nodes
    When it emits an engine step event
    Then kind shall be no-path
    And path shall be null
    And the visualizer status shall become failed

  Scenario: Define statistics
    Given the visualizer exposes AstarStats
    Then evaluatedNodes shall be a number
    And openSize shall be a number
    And closedSize shall be a number
    And pathLength shall be a number or null
    And elapsedMs shall be a number
    And status shall be idle, running, paused, completed, or failed
```

This closes the KISS gaps without adding runtime complexity. It defines the contracts needed for deterministic implementation.

# Lit3 - Web Components 

Yes. Keep the Lit components **thin** and move replaceable behavior into **Reactive Controllers**.

```txt
astar-visualizer/
  contracts/
    AstarVisualizerContracts.ts

  components/
    AstarVisualizerElement.ts
    AstarGridElement.ts
    AstarCellElement.ts
    AstarControlsElement.ts
    AstarSettingsElement.ts
    AstarStatsElement.ts

  controllers/
    AstarPlaybackController.ts
    AstarGridInteractionController.ts
    AstarProjectionController.ts
    AstarStatsController.ts
    AstarSettingsController.ts

  ports/
    IAstarEnginePort.ts
    IAstarStepRunner.ts

  policies/
    IPlacementPolicy.ts
    DefaultPlacementPolicy.ts

  projection/
    IGridStepProjector.ts
    DefaultGridStepProjector.ts
```

## Component / Controller split

```txt
<astar-visualizer>
  owns:
    - AstarPlaybackController
    - AstarProjectionController
    - AstarStatsController
    - AstarSettingsController

  depends on:
    - IAstarEnginePort
    - IGridStepProjector
    - IPlacementPolicy

<astar-grid>
  owns:
    - AstarGridInteractionController

  depends on:
    - GridSnapshot
    - PlacementMode

<astar-cell>
  owns:
    - no controller by default

<astar-controls>
  owns:
    - no controller by default

<astar-settings>
  owns:
    - no controller by default

<astar-stats>
  owns:
    - no controller by default
```

## KISS rule

Use Reactive Controllers only for behavior with lifecycle or replaceable policy.

Do **not** make every small function a controller.

Good controller candidates:

```txt
PlaybackController      => timer, play, pause, step
GridInteractionController => pointer down/move/up
ProjectionController    => engine step -> GridDiff/GridSnapshot
StatsController         => engine step -> AstarStats
SettingsController      => settings validation/application
```

Bad controller candidates:

```txt
CellColorController
CostTextController
ButtonClickController
RoleClassController
```

Those stay inside rendering helpers or template logic.

---

# Lit 3 component breakdown

## 1. `<astar-visualizer>`

Top-level orchestration shell.

```ts
export class AstarVisualizerElement extends LitElement {
  private readonly playbackController: AstarPlaybackController;
  private readonly projectionController: AstarProjectionController;
  private readonly statsController: AstarStatsController;
  private readonly settingsController: AstarSettingsController;

  @state()
  private gridSnapshot: GridSnapshot = [];

  @state()
  private stats: AstarStats = createIdleStats();

  @state()
  private placementMode: PlacementMode = "wall";

  @state()
  private settings: AstarSettings = createDefaultSettings();

  public constructor() {
    super();

    const enginePort = createAstarEnginePort();
    const projector = new DefaultGridStepProjector();
    const placementPolicy = new DefaultPlacementPolicy();

    this.projectionController = new AstarProjectionController(this, projector);
    this.statsController = new AstarStatsController(this);
    this.settingsController = new AstarSettingsController(this, enginePort);
    this.playbackController = new AstarPlaybackController(this, enginePort);
  }
}
```

Responsibility:

```txt
- wire child components
- own application state
- connect engine port to projection/stats/playback
- never render individual cell internals
```

---

## 2. `<astar-grid>`

Grid rendering and pointer input boundary.

```ts
export class AstarGridElement extends LitElement {
  private readonly interactionController: AstarGridInteractionController;

  @property({ type: Array })
  public gridSnapshot: GridSnapshot = [];

  @property({ type: Number })
  public rows = 0;

  @property({ type: Number })
  public cols = 0;

  @property({ type: Number })
  public cellSize = 24;

  @property({ type: Boolean })
  public showCosts = false;

  @property()
  public placementMode: PlacementMode = "wall";

  public constructor() {
    super();

    this.interactionController = new AstarGridInteractionController(this);
  }
}
```

Responsibility:

```txt
- render rows/cols
- render <astar-cell>
- translate pointer position into row/col
- emit cell-click and cell-drag
- never mutate algorithm state
```

---

## 3. `<astar-cell>`

Pure rendering component.

```ts
export class AstarCellElement extends LitElement {
  @property({ type: Object })
  public state: CellState = createEmptyCellState();

  @property({ type: Boolean })
  public showCosts = false;

  @property({ type: Number })
  public row = 0;

  @property({ type: Number })
  public col = 0;
}
```

Responsibility:

```txt
- render role
- render visit state
- render costs
- render optional parent direction
- emit no algorithm events
```

No controller needed unless cell interaction becomes complex later.

---

## 4. `<astar-controls>`

Dumb event emitter.

```ts
export class AstarControlsElement extends LitElement {
  @property()
  public status: AstarStatus = "idle";

  @property({ type: Number })
  public millisecondsPerStep = 50;

  @property()
  public placementMode: PlacementMode = "wall";
}
```

Responsibility:

```txt
- emit start
- emit pause
- emit step
- emit reset
- emit speed-change
- emit placement-mode-change
```

No controller needed.

---

## 5. `<astar-settings>`

Dumb settings editor.

```ts
export class AstarSettingsElement extends LitElement {
  @property({ type: Object })
  public settings: AstarSettings = createDefaultSettings();

  @property({ type: Boolean })
  public disabled = false;
}
```

Responsibility:

```txt
- render heuristic selector
- render movement mode selector
- render diagonal/corner-cutting options
- render weight input
- emit settings-change
```

No engine dependency.

---

## 6. `<astar-stats>`

Pure display component.

```ts
export class AstarStatsElement extends LitElement {
  @property({ type: Object })
  public stats: AstarStats = createIdleStats();
}
```

Responsibility:

```txt
- display evaluated nodes
- display open size
- display closed size
- display path length
- display elapsed time
- display status
```

No controller needed.

---

# Reactive Controller breakdown

## `AstarPlaybackController`

```txt
Owns:
- play/pause state
- interval/timer
- manual step
- speed

Depends on:
- IAstarEnginePort

Emits/upcalls:
- onStep(AstarEngineStepEvent)
- onCompleted()
- onFailed()
```

```ts
export interface IAstarPlaybackHost extends ReactiveControllerHost {
  readonly millisecondsPerStep: number;

  applyEngineStep(step: AstarEngineStepEvent): void;
  setStatus(status: AstarStatus): void;
}
```

---

## `AstarGridInteractionController`

```txt
Owns:
- pointer down/move/up
- drag phase
- coordinate calculation
- duplicate drag suppression

Depends on:
- grid host only

Emits:
- cell-click
- cell-drag
```

```ts
export interface IAstarGridInteractionHost extends ReactiveControllerHost {
  readonly rows: number;
  readonly cols: number;
  readonly cellSize: number;

  emitCellClick(detail: CellClickEventDetail): void;
  emitCellDrag(detail: CellDragEventDetail): void;
}
```

---

## `AstarProjectionController`

```txt
Owns:
- current GridSnapshot
- applying GridDiff
- projecting EngineStepEvent to GridDiff

Depends on:
- IGridStepProjector
```

```ts
export interface IGridStepProjector {
  project(step: AstarEngineStepEvent): GridDiff;
}
```

---

## `AstarStatsController`

```txt
Owns:
- AstarStats calculation
- status transitions
- pathLength extraction

Depends on:
- EngineStepEvent only
```

```ts
export interface IAstarStatsCalculator {
  calculate(step: AstarEngineStepEvent, current: AstarStats): AstarStats;
}
```

---

## `AstarSettingsController`

```txt
Owns:
- settings validation
- applying settings to engine port
- rejecting unsafe changes while running

Depends on:
- IAstarEnginePort
```

```ts
export interface IAstarSettingsValidator {
  validate(settings: AstarSettings): AstarSettingsValidationResult;
}
```

---

# Extension points

Keep these as interfaces, not components.

```ts
export interface IAstarEnginePort {
  configure(settings: AstarSettings): void;
  reset(snapshot: GridSnapshot): void;
  next(): AstarEngineStepEvent;
}

export interface IGridStepProjector {
  project(step: AstarEngineStepEvent): GridDiff;
}

export interface IPlacementPolicy {
  canPlace(
    coordinate: GridCoordinate,
    mode: PlacementMode,
    snapshot: GridSnapshot,
  ): boolean;
}

export interface IAstarStatsCalculator {
  calculate(
    step: AstarEngineStepEvent,
    current: AstarStats,
  ): AstarStats;
}
```

This gives extension without bloating the components:

```txt
Dijkstra support      => new engine port
BFS support           => new engine port
Jump Point Search     => new engine port + projector if needed
Different wall policy => new placement policy
Different stats       => new stats calculator
Different visuals     => replace <astar-cell>
```

---

# Final KISS architecture

```txt
Components:
  render and emit DOM events

Reactive Controllers:
  own lifecycle behavior

Ports:
  isolate your existing A* engine

Policies:
  validate user placement/settings

Projectors:
  convert engine steps to grid state

Contracts:
  define exact event and state shapes
```

The important correction:

```txt
<astar-visualizer> does not contain the A* algorithm.
<astar-visualizer> contains controllers.
Controllers depend on ports.
Ports adapt your existing A* module.
```

It is applied **before implementation**, not after the components exist.

The uploaded `specification.for.ai.md` says AI-assisted code must treat it as the **primary implementation contract** unless explicitly overridden. It applies to all generated or modified code in the codebase. 

For the A* visualizer, apply it in this order:

```txt
1. Contracts first
   - Event payloads
   - GridSnapshot
   - GridDiff
   - EngineStepEvent
   - AstarStats

2. Ports second
   - IAstarEnginePort
   - IGridStepProjector
   - IPlacementPolicy
   - IAstarStatsCalculator

3. Reactive Controllers third
   - PlaybackController
   - GridInteractionController
   - ProjectionController
   - StatsController
   - SettingsController

4. Lit components last
   - astar-visualizer
   - astar-grid
   - astar-cell
   - astar-controls
   - astar-settings
   - astar-stats
```

So the rule is:

```txt
Contracts define what is allowed.
Ports isolate the existing A* module.
Controllers own behavior/lifecycle.
Lit components render state and emit typed events.
```

Do **not** start by coding `<astar-visualizer>`.
Start with the contracts and tests for those contracts. Then implement controllers and components around them.

Correct. I jumped to implementation too early.

Below is the **specification first**. No PowerShell. No implementation.

# A* Visualizer Grid Editing Specification

## Scope

The visualizer must support:

```txt
- loading a grid from JSON
- exporting the editable grid to JSON
- selecting obstacle types from a toolbox
- drag-and-drop obstacle placement
- immutable grid updates
- deterministic engine reset after edits
- recalculation after grid modification
- obstacle metadata for different terrain/blocking types
```

The persisted model must not contain transient algorithm state such as:

```txt
- open nodes
- closed nodes
- current node
- final path
- g/h/f costs
- parent direction
```

Those belong only to runtime `GridSnapshot`.

---

# Minimal structural contracts

## Persisted document

```txt
AstarGridDocument
  schemaVersion: 1
  rows: number
  cols: number
  start: GridCoordinate | null
  goal: GridCoordinate | null
  walls: GridCoordinate[]
  obstacles: PlacedObstacle[]
```

## Placed obstacle

```txt
PlacedObstacle
  id: string
  obstacleType: ObstacleType
  origin: GridCoordinate
  cells: GridCoordinate[]
  metadata?: ObstacleMetadata
```

## Obstacle type

```txt
ObstacleType
  wall
  weighted
  slow-zone
  forbidden
  custom
```

## Obstacle metadata

```txt
ObstacleMetadata
  weight?: number
  movementCost?: number
  blocksMovement?: boolean
  label?: string
```

## Runtime grid snapshot extension

`CellState` must support obstacle metadata:

```txt
CellState
  role
  visitState
  g
  h
  f
  parentDirection
  obstacleType?: ObstacleType
  obstacleMetadata?: ObstacleMetadata
```

Runtime state remains separate from persisted JSON.

---

# Minimal new DOM events

## `toolbox-select`

```txt
detail:
  obstacleType: ObstacleType
```

Emitted by:

```txt
<astar-obstacle-toolbox>
```

Handled by:

```txt
<astar-visualizer>
```

---

## `cell-drop`

```txt
detail:
  row: number
  col: number
  obstacleType: ObstacleType
```

Emitted by:

```txt
<astar-grid>
```

Handled by:

```txt
<astar-visualizer>
```

---

## `grid-loaded`

```txt
detail:
  document: AstarGridDocument
```

Emitted by:

```txt
<astar-grid-loader>
```

Handled by:

```txt
<astar-visualizer>
```

Reason: validation must happen before creating the runtime snapshot.

---

## `grid-changed`

```txt
detail:
  snapshot: GridSnapshot
```

Emitted by:

```txt
<astar-visualizer>
```

Used when consumers need to observe the derived runtime grid.

---

# New Web Components

```txt
<astar-obstacle-toolbox>
  Responsibility:
    - render selectable obstacle types
    - emit toolbox-select
    - optionally provide drag source metadata

<astar-grid-loader>
  Responsibility:
    - accept JSON input
    - emit grid-loaded
    - never mutate grid state directly

<astar-grid>
  Existing responsibility extended:
    - receive dropped obstacle
    - emit cell-drop
    - still does not mutate algorithm state

<astar-cell>
  Existing responsibility extended:
    - render obstacleType
    - render obstacleMetadata if needed

<astar-visualizer>
  Existing responsibility extended:
    - own AstarGridDocument
    - validate document
    - derive GridSnapshot
    - reset engine after edits
    - invalidate transient path state
```

---

# Required policies / services

```txt
GridDocumentValidator
  Validates loaded JSON document.

GridDocumentToSnapshotMapper
  Converts persisted document to runtime GridSnapshot.

GridDocumentSerializer
  Converts current editable document to deterministic JSON.

ObstaclePlacementPolicy
  Validates obstacle placement.

GridEditingController
  Applies edit commands immutably.

RecalculationController
  Invalidates path state and resets engine.
```

---

# Validation rules

A grid document is invalid when:

```txt
- schemaVersion is unsupported
- rows or cols are not positive integers
- start is outside grid
- goal is outside grid
- wall is outside grid
- wall overlaps start
- wall overlaps goal
- obstacle cell is outside grid
- obstacle overlaps start
- obstacle overlaps goal
- obstacle type is unknown
- duplicate obstacle id exists
```

Optional but recommended:

```txt
- reject duplicate wall coordinates
- reject obstacle/wall overlap unless policy allows replacement
```

---

# Feature: Editable A* grid visualizer

```gherkin
Feature: Editable A* grid visualizer

  The A* visualizer shall allow users to load, edit, export, and recalculate
  grid-based pathfinding state while keeping persisted grid data separate from
  transient algorithm state.

  Background:
    Given the visualizer owns an editable grid document
    And the grid snapshot is derived from the grid document
    And transient algorithm state is not persisted
    And the A* engine is accessed through an engine port
```

---

## Scenario: Load grid from JSON

```gherkin
Scenario: Load grid from JSON
  Given the application loads a grid JSON document
  When astar-visualizer receives the JSON data
  Then the visualizer shall validate the JSON document
  And the visualizer shall validate start, goal, wall, and obstacle positions
  And the visualizer shall construct a grid snapshot from the JSON
  And the visualizer shall assign the snapshot to astar-grid
  And the visualizer shall reset algorithm state deterministically
  And the visualizer shall notify the engine port of the new grid configuration
```

---

## Scenario: Reject invalid grid JSON

```gherkin
Scenario: Reject invalid grid JSON
  Given the application loads a grid JSON document
  And the document contains an obstacle outside the grid
  When astar-visualizer validates the document
  Then the visualizer shall reject the document
  And the current grid snapshot shall remain unchanged
  And the engine port shall not be reset
```

---

## Scenario: Export grid to JSON

```gherkin
Scenario: Export grid to JSON
  Given the user requests to save the current grid
  When astar-visualizer serializes the grid
  Then the JSON shall include rows and cols
  And the JSON shall include start and goal
  And the JSON shall include walls
  And the JSON shall include obstacle metadata
  And the JSON shall not include open nodes
  And the JSON shall not include closed nodes
  And the JSON shall not include current node
  And the JSON shall not include path nodes
  And the JSON shall not include g, h, or f costs
  And the JSON shall not include parent direction
```

---

## Scenario: Select obstacle type from toolbox

```gherkin
Scenario: Select obstacle type from toolbox
  Given a toolbox menu exists for selecting obstacle types
  When the user selects an obstacle type
  Then astar-obstacle-toolbox shall emit toolbox-select
  And the event detail shall include obstacleType
  And astar-visualizer shall store the active obstacle type
  And subsequent drag-and-drop operations shall use that obstacle type
```

---

## Scenario: Drag and drop obstacle from toolbox

```gherkin
Scenario: Drag and drop obstacle from toolbox
  Given the user has selected an obstacle type from the toolbox
  When the user drops it onto a grid coordinate
  Then astar-grid shall emit cell-drop
  And the event detail shall include row
  And the event detail shall include col
  And the event detail shall include obstacleType
  And astar-visualizer shall validate the placement
  And astar-visualizer shall update the grid document immutably
  And astar-visualizer shall derive a new grid snapshot
  And astar-visualizer shall assign the snapshot to astar-grid
```

---

## Scenario: Recalculate path after grid modification

```gherkin
Scenario: Recalculate path after grid modification
  Given the grid has been modified by placement or removal of obstacles
  When the modification is applied
  Then astar-visualizer shall invalidate any existing path
  And astar-visualizer shall reset open, closed, and path states
  And astar-visualizer shall clear g, h, and f costs
  And astar-visualizer shall clear parent directions
  And astar-visualizer shall reset statistics to idle
  And astar-visualizer shall request a new path calculation from the engine
```

---

## Scenario: Prevent invalid obstacle placement

```gherkin
Scenario: Prevent invalid obstacle placement
  Given the user drags an obstacle onto a cell
  When the cell is the start node
  Then astar-visualizer shall reject the placement
  And the grid document shall remain unchanged
  And the grid snapshot shall remain unchanged
  And the engine port shall not be reset

Scenario: Prevent obstacle placement on goal
  Given the user drags an obstacle onto a cell
  When the cell is the goal node
  Then astar-visualizer shall reject the placement
  And the grid document shall remain unchanged
  And the grid snapshot shall remain unchanged
  And the engine port shall not be reset
```

---

## Scenario: Obstacle metadata support

```gherkin
Scenario: Obstacle metadata support
  Given obstacles may have types or properties
  When an obstacle is placed
  Then the grid document shall store the obstacle type
  And the grid document may store obstacle metadata
  And the grid snapshot shall expose the obstacle type on affected cells
  And astar-cell shall render the obstacle according to its type
```

---

## Scenario: Notify algorithm of grid changes

```gherkin
Scenario: Notify algorithm of grid changes
  Given the grid snapshot has changed
  When astar-visualizer updates the snapshot
  Then astar-visualizer shall notify the engine port of the new grid configuration
  And the engine shall reset its internal state deterministically
  And previous algorithm progress shall not be reused
```

---

## Scenario: Maintain determinism after edits

```gherkin
Scenario: Maintain determinism after edits
  Given the user modifies the grid
  And the visualizer resets the engine
  When the algorithm is executed again
  Then the step sequence shall be deterministic for the new grid
  And the rendered grid states shall be deterministic for the new grid
  And the final statistics shall be deterministic except for wall-clock timing
```

---

# Minimal command model

Use commands internally. DOM events should not mutate state directly.

```txt
PlaceObstacleCommand
  obstacleType
  coordinate

RemoveObstacleCommand
  coordinate

LoadGridDocumentCommand
  document

ClearGridCommand
  preserveStartAndGoal

ExportGridDocumentQuery
```

Flow:

```txt
DOM event
  -> astar-visualizer
  -> editing controller
  -> validation policy
  -> document update
  -> snapshot mapper
  -> engine reset
  -> grid update
```

---

# Required test coverage from this specification

```txt
GridDocumentValidator
  - accepts valid document
  - rejects invalid schemaVersion
  - rejects start outside grid
  - rejects goal outside grid
  - rejects wall on start
  - rejects wall on goal
  - rejects obstacle outside grid
  - rejects obstacle on start
  - rejects obstacle on goal
  - rejects duplicate obstacle id

GridDocumentToSnapshotMapper
  - maps start
  - maps goal
  - maps walls
  - maps obstacle type
  - maps obstacle metadata
  - does not create transient path state

GridDocumentSerializer
  - includes start, goal, walls, obstacles
  - excludes open, closed, path, costs, parentDirection
  - serializes deterministically

ObstaclePlacementPolicy
  - accepts valid obstacle placement
  - rejects placement outside grid
  - rejects placement on start
  - rejects placement on goal

GridEditingController
  - applies obstacle placement immutably
  - rejects invalid placement without mutation
  - emits/returns grid changed result
  - invalidates runtime algorithm state

RecalculationController
  - resets stats to idle
  - clears path/open/closed state
  - resets engine port with new snapshot

Lit component integration
  - toolbox emits toolbox-select
  - grid emits cell-drop
  - visualizer handles grid-loaded
  - visualizer updates grid after valid load
  - visualizer does not update grid after invalid load
```

This is the specification layer that should exist before any implementation.
