Feature: Editable A* grid visualizer

  The A* visualizer shall allow users to load, edit, export, and recalculate
  grid-based pathfinding state while keeping persisted grid data separate from
  transient algorithm state.

  Background:
    Given the visualizer owns an editable grid document
    And the grid snapshot is derived from the grid document
    And transient algorithm state is not persisted
    And the A* engine is accessed through an engine port

  Scenario: Load grid from JSON
    Given the application loads a grid JSON document
    When astar-visualizer receives the JSON data
    Then the visualizer shall validate the JSON document
    And the visualizer shall validate start, goal, wall, and obstacle positions
    And the visualizer shall construct a grid snapshot from the JSON
    And the visualizer shall assign the snapshot to astar-grid
    And the visualizer shall reset algorithm state deterministically
    And the visualizer shall notify the engine port of the new grid configuration

  Scenario: Reject invalid grid JSON
    Given the application loads a grid JSON document
    And the document contains an obstacle outside the grid
    When astar-visualizer validates the document
    Then the visualizer shall reject the document
    And the current grid snapshot shall remain unchanged
    And the engine port shall not be reset

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

  Scenario: Select obstacle type from toolbox
    Given a toolbox menu exists for selecting obstacle types
    When the user selects an obstacle type
    Then astar-obstacle-toolbox shall emit toolbox-select
    And the event detail shall include obstacleType
    And astar-visualizer shall store the active obstacle type
    And subsequent drag-and-drop operations shall use that obstacle type

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

  Scenario: Recalculate path after grid modification
    Given the grid has been modified by placement or removal of obstacles
    When the modification is applied
    Then astar-visualizer shall invalidate any existing path
    And astar-visualizer shall reset open, closed, and path states
    And astar-visualizer shall clear g, h, and f costs
    And astar-visualizer shall clear parent directions
    And astar-visualizer shall reset statistics to idle
    And astar-visualizer shall request a new path calculation from the engine

  Scenario: Prevent obstacle placement on start
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

  Scenario: Obstacle metadata support
    Given obstacles may have types or properties
    When an obstacle is placed
    Then the grid document shall store the obstacle type
    And the grid document may store obstacle metadata
    And the grid snapshot shall expose the obstacle type on affected cells
    And astar-cell shall render the obstacle according to its type

  Scenario: Notify algorithm of grid changes
    Given the grid snapshot has changed
    When astar-visualizer updates the snapshot
    Then astar-visualizer shall notify the engine port of the new grid configuration
    And the engine shall reset its internal state deterministically
    And previous algorithm progress shall not be reused

  Scenario: Maintain determinism after edits
    Given the user modifies the grid
    And the visualizer resets the engine
    When the algorithm is executed again
    Then the step sequence shall be deterministic for the new grid
    And the rendered grid states shall be deterministic for the new grid
    And the final statistics shall be deterministic except for wall-clock timing
