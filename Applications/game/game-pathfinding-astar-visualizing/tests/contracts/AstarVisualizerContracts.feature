Feature: A* visualizer structural contracts

  The A* visualizer shall define the minimal shared contracts required for
  deterministic rendering, playback, projection, statistics, and testing.

  Background:
    Given the A* visualizer uses typed contract definitions
    And the visualizer does not expose magic strings to consumers
    And grid state is represented as immutable snapshots or ordered diffs

  Scenario: Define grid cell state
    Given a cell is represented by CellState
    Then the cell shall have exactly one role
    And the role shall be empty, start, goal, or wall
    And the cell shall have exactly one visit state
    And the visit state shall be unvisited, open, closed, current, or path
    And g, h, and f costs shall be numbers or null
    And parentDirection shall be a direction or null

  Scenario: Define immutable grid snapshots
    Given a GridSnapshot is provided to astar-grid
    Then it shall be a readonly two-dimensional collection of CellState values
    And the first dimension shall represent rows
    And the second dimension shall represent columns
    And consumers shall not mutate the snapshot directly

  Scenario: Define grid diffs
    Given a GridDiff is produced by the projection layer
    Then each patch shall contain row and col
    And each patch may contain role, visitState, g, h, f, or parentDirection
    And missing patch fields shall mean unchanged
    And nullable patch fields set to null shall clear their value
    And patches shall be applied in order
    And if multiple patches target the same cell, the last patch shall win

  Scenario: Define cell click event payload
    Given the user clicks a grid cell
    When astar-grid emits cell-click
    Then the event detail shall contain row
    And the event detail shall contain col
    And the event detail shall contain no algorithm state

  Scenario: Define cell drag event payload
    Given the user drags across the grid
    When astar-grid emits cell-drag
    Then the event detail shall contain row
    And the event detail shall contain col
    And the event detail shall contain phase
    And phase shall be start, move, or end

  Scenario: Define playback control event names
    Given the user interacts with astar-controls
    Then play shall emit start
    And pause shall emit pause
    And manual stepping shall emit step
    And reset shall emit reset
    And speed changes shall emit speed-change
    And placement mode changes shall emit placement-mode-change

  Scenario: Define reset event payload
    Given the user resets the visualization
    When astar-controls emits reset
    Then the event detail shall contain preserveWalls
    And the event detail shall contain preserveStartAndGoal

  Scenario: Define speed change event payload
    Given the user changes playback speed
    When astar-controls emits speed-change
    Then the event detail shall contain millisecondsPerStep
    And millisecondsPerStep shall be greater than zero

  Scenario: Define placement mode event payload
    Given the user changes placement mode
    When astar-controls emits placement-mode-change
    Then the event detail shall contain mode
    And mode shall be start, goal, wall, or erase

  Scenario: Define settings change event payload
    Given the user changes algorithm settings
    When astar-settings emits settings-change
    Then the event detail shall contain settings
    And settings shall contain heuristic
    And settings shall contain movementMode
    And settings shall contain allowCornerCutting
    And settings shall contain weight

  Scenario: Define engine step event contract
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

  Scenario: Define successful completion marker
    Given the engine finds a path
    When it emits an engine step event
    Then kind shall be path-found
    And path shall contain the ordered coordinates from start to goal

  Scenario: Define failed completion marker
    Given the engine exhausts all reachable nodes
    When it emits an engine step event
    Then kind shall be no-path
    And path shall be null

  Scenario: Define statistics model
    Given the visualizer exposes AstarStats
    Then evaluatedNodes shall be a number
    And openSize shall be a number
    And closedSize shall be a number
    And pathLength shall be a number or null
    And elapsedMs shall be a number
    And status shall be idle, running, paused, completed, or failed
