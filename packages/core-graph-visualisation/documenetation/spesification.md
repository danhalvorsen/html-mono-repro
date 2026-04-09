# Core Graph Visualization Contract

This document is a normative, testable contract.

## Contract Rules

1. Every `Scenario S-###` is a required acceptance contract.
2. A change is compliant only if all affected scenarios are verified by automated tests.
3. Scenario language is authoritative over implementation details.
4. Implementations may vary internally, but observable behavior must satisfy scenario outcomes.
5. Tests must use behavior-oriented naming and include Given/When/Then semantics.
6. If behavior changes, this contract must be updated first or in the same change set.

## Verification Rules

1. Unit tests verify deterministic domain and strategy behavior.
2. Integration tests verify host/controller adaptation and life cycle behavior.
3. For any failing scenario, release readiness is blocked until remediation or approved contract update.
@attr attrName: attrType = value;
---

# Core Graph Visualization — Consolidated Behavioral Specification
## Scope
Covers:

* interaction (selection, drag, connection)
* rendering
* hierarchy analysis
* geometry
* styling
* FSM and pointer propagation

---

# 1. Selection & Highlighting

### Scenario S-001: Node selection
@attr attrName: attrType = value;
**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rendered node
**When** the user left-clicks the node body
**Then** the node becomes the highlighted node
**And** any highlighted edge is cleared

--<slot></slot>

### Scenario S-002: Connection point selection
@attr attrName: attrType = value;
**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with connection point CP1
**When** the user left-clicks CP1
**Then** the owning node becomes the highlighted node
**And** CP1 becomes the highlighted connection point
**And** CP1 becomes the default connection point for the node
**And** any highlighted edge is cleared

---

### Scenario S-003: Edge selection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rendered edge
**When** the user left-clicks the edge
**Then** the edge becomes the highlighted edge
**And** the highlighted node is cleared

---

# 2. Node Movement

### Scenario S-004: Drag node

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rendered node
**When** the user presses and drags the node
**Then** the node position follows the pointer using a temporary position override
**And** the node remains within visualization boundaries

---

### Scenario S-005: Single active drag

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an active drag interaction
**When** another drag interaction attempts to start
**Then** it is ignored until the current drag is released

---

### Scenario S-006: Drag lifecycle (FSM)

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** no active drag owner
**When** drag starts
**Then** state transitions to dragging
**And** owner is stored

**Given** dragging is active
**When** drag stops
**Then** state transitions to idle
**And** owner is cleared

---

# 3. Connection Interaction

### Scenario S-007: Start connection drag

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with connection point CP1
**When** the user presses and holds on CP1
**Then** the owning node becomes highlighted
**And** CP1 becomes highlighted
**And** CP1 becomes the default connection point
**And** any highlighted edge is cleared
**And** a draft edge starts from CP1

---

### Scenario S-008: Draft edge rendering
@attr attrName: attrType = value;
**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.
@attr attrName: attrType = value;
**Given** an active draft edge from CP1
**When** the pointer moves
**Then** the draft edge endpoint follows the pointer
**And** a temporary line is rendered

---

### Scenario S-009: Hover connection target

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an active draft edge
**When** the pointer enters CP2
**Then** CP2 becomes the hovered connection point
**And** CP2 is eligible as connection target

---

### Scenario S-010: Complete connection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a draft edge from CP1
**And** the pointer is hovering CP2
**When** the pointer is released
**Then** CP2 becomes highlighted
**And** a connection request is emitted from CP1 to CP2

---

### Scenario S-011: Connection endpoints must match selected start and target connection points

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with selected connection point CP1
**And** the user drags a connection from CP1 to another node connection point CP2
**When** the relation is established
**Then** the created edge start endpoint is CP1
**And** the created edge end endpoint is CP2
**And** the rendered line path starts at CP1 connector center and ends at CP2 connector center

---

### Scenario S-012: Cancel connection (invalid target)

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a draft edge
**When** pointer is released outside a valid target
**Then** no connection request is emitted
**And** the draft edge is cleared

---

### Scenario S-013: Cancel connection (same source)

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a draft edge from CP1
**When** pointer is released on CP1
**Then** no connection request is emitted
**And** the draft edge is cleared

---

# 4. Graph Mutation Rules

### Scenario S-014: Create edge between nodes

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a connection request from node A (CP1) to node B (CP2)
**When** A ≠ B
**And** no identical edge exists
**Then** an edge is created from A to B
**And** node B becomes selected

---

### Scenario S-015: Prevent self-connection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a connection request from node A to node A
**When** processed
**Then** no edge is created

---

### Scenario S-016: Prevent duplicate edge

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an existing edge A → B
**When** a duplicate request occurs
**Then** no additional edge is created

---

# 5. Node Creation (Right-click)

### Scenario S-017: Create child node from node

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with a default connection point
**When** the user right-clicks the node
**Then** a new child node is created
**And** an edge is created from the node’s default connection point

---

### Scenario S-018: Create child node from connection point

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with connection point CP1
**When** the user right-clicks CP1
**Then** CP1 becomes the default connection point
**And** a new child node is created
**And** an edge is created from CP1

---

### Scenario S-019: Resolve parent node priority

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a highlighted node exists
**When** a right-click occurs
**Then** the highlighted node is used as parent

**Else if** a selected node exists
**Then** the selected node is used

---

### Scenario S-020: Override default connection point

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node has a stored default connection point
**And** another connection point is currently highlighted
**When** creating a child node
**Then** the highlighted connection point is used

---

### Scenario S-021: Child node positioning

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a parent node and connector role
**When** a child node is created
**Then** the child node is positioned in the direction of the connector
**And** initial position is stored as an override

---

# 6. Rendering

### Scenario S-022: Render scene

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a graph scene
**When** rendered
**Then** an SVG with boundary is produced

---

### Scenario S-023: Render nodes

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node
**When** rendered
**Then** it is rendered as:

* circle if circular representation
* rectangle otherwise

---

### Scenario S-024: Render node label

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node
**When** rendered
**Then** a label is rendered inside a foreignObject slot

---

### Scenario S-025: Render edges

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** edges
**When** rendered
**Then** each edge is rendered as an SVG path

---

### Scenario S-026: Highlight edge rendering

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a highlighted edge
**When** rendered
**Then** highlighted styling and endpoint markers are applied

---

### Scenario S-027: Conditional connection points

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node
**When** node is highlighted or draft is active
**Then** connection points are rendered
**Else** they are hidden

---

### Scenario S-028: Draft edge rendering

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a draft edge
**When** rendered
**Then** a temporary path is drawn

---

# 7. Connector Geometry

### Scenario S-029: Select nearest connection point

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node with connection points
**When** computing edge connector
**Then** the nearest connection point to target is used

---

### Scenario S-030: Circle fallback

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a circular node without connection points
**When** computing connector
**Then** connector is placed on circle perimeter

---

### Scenario S-031: Box fallback

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rectangular node without connection points
**When** computing connector
**Then** connector is placed on dominant axis edge

---

### Scenario S-032: Path creation

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** two connectors
**When** generating path
**Then** path is `M x1 y1 L x2 y2`

---

### Scenario S-033: Connection point placement

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node and role
**When** placing connection point
**Then** it is placed according to role or angle

---

# 8. Hierarchy Analysis

### Scenario S-034: Empty graph

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** no graph or no nodes
**When** analyzed
**Then** empty result is returned

---

### Scenario S-035: Subgraph detection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** disconnected graph
**When** analyzed
**Then** each component receives unique subgraph index

---

### Scenario S-036: Root detection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** nodes with no incoming edges
**When** analyzed
**Then** they are roots

---

### Scenario S-037: Level computation

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** graph with roots
**When** analyzed
**Then**:

* roots → level 0
* children → level ≥ parent + 1
* multiple parents → max level applied

---

### Scenario S-038: Level fallback

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** unreachable node
**When** analyzed
**Then** level = 0

---

### Scenario S-039: Sub-level ordering

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** nodes in same level
**When** grouped
**Then** sorted by id and indexed

---

### Scenario S-040: Hierarchy metadata

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** node processed
**Then** it contains:

* level
* subLevel
* levelSize
* maxLevel
* subgraphIndex

---

# 9. Node Styling

### Scenario S-041: Compute style

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** node and hierarchy
**When** styling
**Then** size and color derived from hierarchy

---

### Scenario S-042: Fallback style

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** missing hierarchy
**When** styling
**Then** defaults are used

---

### Scenario S-043: Auto scaling

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** scene
**When** computing scale
**Then** nodeScale is based on:

* width distribution
* height distribution
* density

---

# 10. Pointer Event Propagation

### Scenario S-044: Pointer move

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** listeners
**When** pointer moves
**Then** all listeners are notified

---

### Scenario S-045: Pointer up

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** listeners
**When** pointer up occurs
**Then** all listeners are notified

---

### Scenario S-046: Unsubscribe

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a listener
**When** unsubscribed
**Then** it stops receiving events

---

# 11. Edge Deletion (Delete Key)

### Scenario S-047: A selected edge can be deleted with the Delete key

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rendered edge between two nodes
**And** that edge is selected
**When** the user presses the Delete key
**Then** the relation represented by that edge is removed
**And** the edge is no longer rendered
**And** the two nodes remain in the graph

---

### Scenario S-048: Delete removes only the selected edge relation

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a graph with multiple edges
**And** one edge is selected
**When** the user presses the Delete key
**Then** only the selected edge is removed
**And** all other edges remain unchanged
**And** all nodes remain unchanged

---

### Scenario S-049: Delete does nothing when no edge is selected

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a graph with one or more edges
**And** no edge is selected
**When** the user presses the Delete key
**Then** no relation is removed
**And** the graph remains unchanged

---

### Scenario S-050: Deleting an edge clears the selected edge state

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rendered edge between two nodes
**And** that edge is selected
**When** the user presses the Delete key
**Then** the relation represented by that edge is removed
**And** the selected edge state is cleared

---

### Scenario S-051: Delete ignores node selection when no edge is selected

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a node is selected
**And** no edge is selected
**When** the user presses the Delete key
**Then** no relation is removed
**And** the selected node remains unchanged

---

### Scenario S-052: Edge deletion removes the relation between the correct source and target nodes

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a selected edge from node A to node B
**When** the user presses the Delete key
**Then** the relation from node A to node B is removed
**And** no other node-to-node relation is removed

---

### Scenario S-053: Edge deletion updates the rendered graph immediately

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a selected edge between two nodes
**When** the user presses the Delete key
**Then** the edge is removed from the graph model
**And** the rendered graph no longer shows that edge
**And** no connector path remains between the two nodes

---

### Scenario S-054: Delete key only deletes the currently highlighted edge

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an edge is highlighted
**And** another edge is not highlighted
**When** the user presses the Delete key
**Then** only the highlighted edge relation is removed
**And** the non-highlighted edge remains unchanged

---

### Scenario S-055: Delete key removes the exact rendered connector path for the selected edge

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a selected edge with a rendered line path between node A and node B
**When** the user presses the Delete key
**Then** that exact rendered line path is removed
**And** no rendered path remains for that deleted relation

---

# 12. Layout Abstract Behavior

### Scenario S-056: Layout strategy is resolved through abstraction

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** the visualizer supports multiple layout algorithms
**When** layout constraints are requested
**Then** the host depends on a layout strategy abstraction
**And** rendering code does not contain algorithm-specific force or layering math

---

### Scenario S-057: Snapshot layout strategy returns deterministic constraints

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a snapshot layout strategy
**When** the same graph and canvas constraints are provided repeatedly
**Then** the strategy returns deterministic node anchors and edge constraints
**And** the resulting scene can be rendered without additional layout mutation

---

### Scenario S-058: Animated spring layout updates constraints frame-by-frame

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an animated spring layout strategy is active
**When** animation frames progress
**Then** the strategy advances simulation incrementally
**And** node anchors are recomputed for each frame
**And** rendered node positions transition over time

---

### Scenario S-059: Spring simulation is recreated when graph topology changes

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an active spring simulation session
**When** graph topology changes (node or edge membership)
**Then** the existing simulation session is disposed
**And** a new simulation session is created from the updated graph

---

### Scenario S-060: Spring simulation is recreated when layout bounds change

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an active spring simulation session
**When** canvas dimensions, padding, or node box constraints change
**Then** the simulation session is recreated with new bounds
**And** computed anchors remain within visualization boundaries

---

### Scenario S-061: Animated simulation resources are disposed when animation is inactive

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a spring animation session exists
**When** the selected layout changes to a non-animated strategy
**Then** animation frame updates are stopped
**And** the spring simulation session is disposed

---

### Scenario S-062: Animated simulation resources are disposed on host disconnect

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a spring animation session exists
**When** the visualization host is disconnected
**Then** animation frame updates are stopped
**And** the spring simulation session is disposed

---

### Scenario S-063: A layout strategy is defined by the core graph visualisation contract

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** the `core-graph-visualisation` module defines a layout interface contract  
**And** the contract describes the required layout behavior independently of any UI framework  
**When** a new layout strategy is introduced  
**Then** the strategy must implement the layout interface contract  
**And** the strategy must remain compatible with all consumers of that contract  
**And** the strategy must not require Lit to execute its layout logic

---

### Scenario S-064: Layout logic remains independent of Lit

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout strategy computes node positions and related layout data  
**When** the layout strategy is implemented  
**Then** its layout logic must be framework-agnostic  
**And** it must not depend directly on Lit APIs, Lit elements, or Lit reactive controller lifecycle  
**And** it must be executable and testable in isolation from any Lit host

---

### Scenario S-065: A Lit reactive controller encapsulates a layout strategy

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout strategy implementation exists and conforms to the core layout contract  
**When** the strategy is exposed to a Lit-based UI  
**Then** it must be delivered through a Lit reactive controller  
**And** the reactive controller must encapsulate the layout strategy instance  
**And** the controller must coordinate the strategy with the Lit host lifecycle without moving layout logic into the controller

---

### Scenario S-066: The reactive controller acts as an adapter, not as the layout engine

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a Lit reactive controller wraps a layout strategy  
**When** the host requests layout execution or layout updates  
**Then** the controller must delegate layout computation to the encapsulated strategy  
**And** the controller must only handle host integration concerns  
**And** the controller must not contain layout-specific calculation rules that belong in the strategy

---

### Scenario S-067: All strategies exposed to Lit hosts are delivered uniformly through Lit reactive controllers

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** multiple layout strategies exist in the system  
**When** they are made available to Lit-based consumers  
**Then** each strategy must be exposed through a Lit reactive controller  
**And** each controller must provide a consistent integration model to the host  
**And** the host must be able to switch strategies without changing the underlying layout contract

---

### Scenario S-068: A layout strategy can be replaced without changing host integration

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a Lit host uses a reactive controller that encapsulates a layout strategy  
**When** the current layout strategy is replaced by another strategy implementing the same core contract  
**Then** the Lit host integration model must remain unchanged  
**And** the new strategy must be usable through the same controller abstraction  
**And** the replacement must not require modification of the core layout contract

---

### Scenario S-069: Layout strategies are testable without Lit

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout strategy implements the core layout interface  
**When** unit tests are written for the strategy  
**Then** the tests must be able to execute the strategy without constructing a Lit host  
**And** the expected layout output must be verifiable independently of reactive controller behavior  
**And** Lit-specific integration tests must be limited to controller adaptation behavior

---

### Scenario S-070: Lit-specific behavior is isolated to the reactive controller layer

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** the system uses Lit for reactive UI composition  
**When** layout changes must trigger host updates or rendering reactions  
**Then** the Lit reactive controller must manage those Lit-specific concerns  
**And** the layout strategy must remain unaware of host update mechanisms  
**And** framework coupling must be isolated to the controller boundary

---

### Scenario S-071: Reactive controller integration contract is explicit and minimal

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a Lit reactive controller adapts a layout strategy
**When** the controller is consumed by a host
**Then** the controller must expose explicit lifecycle operations for start, stop, and dispose
**And** the controller must expose a deterministic way to request snapshot or incremental layout updates
**And** the controller contract must not leak strategy implementation details

---

### Scenario S-072: Snapshot and animated execution modes are explicitly defined

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout strategy supports animation
**When** the strategy is executed in snapshot mode
**Then** it must return a deterministic layout model without requiring host frame scheduling

**When** the strategy is executed in animated mode
**Then** it may return incremental layout updates per frame
**And** both modes must preserve the same layout contract shape

---

### Scenario S-073: Invalid layout output is handled with a safe fallback

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout execution returns invalid anchors or edge constraints
**When** validation fails at the controller boundary
**Then** the host must keep the last known valid layout or use a deterministic fallback layout
**And** the error path must be explicit and observable in tests

---

### Scenario S-074: Animation cadence is bounded and coalesced

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** animated layout updates are active
**When** layout recomputation is requested repeatedly for unchanged input
**Then** duplicate recomputation for identical input signatures must be avoided
**And** host update cadence must be bounded to frame scheduling rules
**And** animation scheduling must stop when no animated strategy is active

---

### Scenario S-075: Strategy replacement preserves host integration surface

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a Lit host consumes layout through a controller abstraction
**When** one strategy is replaced with another implementing the same core contract
**Then** host integration APIs must remain unchanged
**And** replacement must not require modifications to the core layout contract
**And** any required simulation reset behavior must be handled inside the controller layer

---

### Scenario S-076: Test matrix separates strategy behavior from controller behavior

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** layout functionality is delivered through strategy plus reactive controller
**When** tests are authored
**Then** strategy unit tests must verify deterministic layout behavior without Lit dependencies
**And** controller integration tests must verify lifecycle, scheduling, disposal, and adaptation behavior
**And** tests must not duplicate algorithm math assertions inside controller-only tests

---

# 13. Graph Visualization Coordinator Orchestration

### Scenario S-077: App delegates visual orchestration to GraphVisualizationCoordinator

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a Lit app hosts the graph visualizer
**When** visual graph behavior is required
**Then** the app delegates orchestration to `GraphVisualizationCoordinator`
**And** the app does not resolve layout scene factories directly
**And** the app does not manage layout controller activation/deactivation directly

---

### Scenario S-078: Coordinator lifecycle state model is explicit and deterministic

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a coordinator with states `Uninitialized`, `Ready`, `Active`, and `Disconnected`
**When** lifecycle operations are invoked
**Then** only allowed transitions are permitted:

* `Uninitialized -> Ready`
* `Ready -> Active`
* `Active -> Active` on resize
* `Active -> Active` on layout switch
* `Ready -> Disconnected`
* `Active -> Disconnected`

**And** disallowed transitions are rejected or ignored deterministically

---

### Scenario S-079: Coordinator rejects unknown layout identifiers

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a coordinator with known layout options
**When** an unknown layout id is requested
**Then** the active layout remains unchanged
**And** no controller activation occurs for unknown layout ids

---

### Scenario S-080: Coordinator handles invalid and equivalent bounds safely

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a coordinator receives resize requests
**When** width or height is zero or negative
**Then** invalid bounds are clamped or rejected deterministically
**And** the coordinator never publishes invalid visualizer dimensions

**When** equivalent effective bounds are applied repeatedly
**Then** no duplicate dimension publish occurs

---

### Scenario S-081: Coordinator avoids redundant activation for repeated same-layout selection

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a layout is already active
**When** the same layout is selected again
**Then** no additional activation occurs
**And** no unnecessary recomputation is triggered

---

### Scenario S-082: Coordinator processes rapid layout switch sequences deterministically

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a rapid sequence of layout selections
**When** multiple selections occur within the same update window
**Then** only the final selected layout remains active
**And** previously activated controllers are deactivated in deterministic order

---

### Scenario S-083: Coordinator disposes animated resources on disconnect

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an animated layout controller is active
**When** host disconnect occurs
**Then** animation scheduling is stopped
**And** animated controller resources are disposed
**And** no frame requests are scheduled after disconnect

---

### Scenario S-084: Coordinator tolerates missing frame update surface

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** an animated layout requests frame updates
**When** no host frame surface is available
**Then** the coordinator handles the condition without throwing
**And** layout/controller state remains consistent

---

### Scenario S-085: Animation cadence is bounded to one host update request per frame

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** animated layout updates are active
**When** multiple update triggers occur in a single animation frame
**Then** at most one host update request is published for that frame

---

### Scenario S-086: Coordinator coalesces recomputation for unchanged layout signatures

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** the active layout id, graph topology signature, and effective bounds are unchanged
**When** layout update is requested repeatedly
**Then** duplicate recomputation is avoided
**And** recompute counters or equivalent observables remain stable

---

### Scenario S-087: App must not instantiate concrete layout controllers

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** the graph visualization app composition is created
**When** the app is instantiated
**Then** the app depends on coordinator abstraction only
**And** concrete layout controller construction does not exist in the app component

---

### Scenario S-088: New layouts are registered without modifying coordinator consumers

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a new layout strategy is introduced through controller registry and coordinator mapping
**When** the layout is registered
**Then** consumers of coordinator output require no behavioral changes
**And** app integration remains the same coordinator binding surface

---

### Scenario S-089: Strategy and controller substitution remain contract-compatible

**Acceptance Criteria**
- The scenario has at least one automated test mapped to this scenario ID.
- The test name follows Given/When/Then behavior phrasing.
- Every Then/And outcome in this scenario is asserted by tests.

**Given** a strategy or controller implementation is replaced with another implementation of the same contract
**When** substitution is performed
**Then** coordinator behavior remains contract-compatible
**And** host integration APIs remain unchanged

---

## Scenario Traceability Matrix

| Scenario ID | Test File | Test Name |
|-------------|-----------|-----------|
| S-077 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationAppArchitecture.test.ts | Given GraphVisualizationApp source When orchestration bindings are inspected Then orchestration is delegated to GraphVisualizationCoordinator |
| S-078 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given disconnected coordinator When layout and resize are invoked Then no host update is requested |
| S-079 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given coordinator When unknown layout id is selected Then active layout remains unchanged |
| S-080 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given invalid resize input When width and height are non-positive Then dimensions are clamped |
| S-081 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given coordinator When same layout is selected again Then no additional host update is requested |
| S-082 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given rapid layout switch sequence When selections are processed Then final selected layout remains active |
| S-083 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given connected coordinator When host disconnects Then all layouts are deactivated |
| S-084 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given missing host frame surface When animation update publish throws Then coordinator keeps state consistent |
| S-085 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given animated updates When multiple update triggers occur in a single frame Then at most one host update request is published for that frame |
| S-086 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given equivalent effective bounds When resize is repeated Then no duplicate host update is requested |
| S-087 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationAppArchitecture.test.ts | Given GraphVisualizationApp source When concrete layout controller construction is inspected Then no concrete layout controllers are instantiated in app component |
| S-088 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given a new registry layout When the layout is selected Then coordinator consumers require no behavioral changes |
| S-089 | Applications/graph-visualization/graph-vizualisation/tests/GraphVisualizationCoordinator.test.ts | Given replacement registries with the same contract When coordinator uses either registry Then host integration surface remains unchanged |
---

## Contract Completion Criteria

1. Every implemented behavior has a matching scenario in this document.
2. Every affected scenario is covered by automated tests.
3. No implementation is accepted if it violates scenario outcomes.

