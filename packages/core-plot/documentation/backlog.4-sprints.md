# `@monorepo/core-plot`

## Sprint Backlog

This backlog is ordered so the core plotting functionality is delivered first.

Each sprint delivers specification-backed behavior, not only implementation tasks.

The canonical source of truth remains:

* `master.spsification.txt`

---

# Sprint 1: Canvas Foundation

## Goal

Establish the minimal plotting platform:

* composition root
* canvas object model
* deterministic rendering
* hit testing
* controller wiring

This sprint creates the foundation required for all later coordinate-system and geometry work.

## Delivery specification scope

Deliver the following behaviors from the master specification:

* CanvasObject identity is stable
* CanvasObject participates in render cycle
* CanvasObject supports hit testing
* CanvasObject interaction opt-in
* Canvas initializes required controllers
* Canvas maintains registered objects
* Canvas renders deterministically
* Canvas delegates behavior to controllers
* MouseController tracks pointer position
* Drag start
* Drag move
* Snap to grid
* Click selects top-most object
* Double click
* Scale interaction

## Implementation backlog

* Define canonical `CanvasObject` contract
* Implement `PlotCanvasElement` as composition root
* Add object registry with deterministic ordering
* Add render context model
* Add hit-testing contract and routing
* Implement controller registration lifecycle
* Implement `MouseController`
* Implement `DragController` minimum lifecycle
* Implement `SnapController` minimum grid snapping
* Implement `OnClickController`
* Implement `OnDoubleClickController`
* Implement `OnScaleController` start semantics only

## Sprint exit criteria

* The canvas can host renderable objects
* Rendering order is deterministic
* Hit testing works for registered objects
* Input events are routed through controllers, not embedded in the host element
* The platform is stable with empty canvas and unsupported interactions

## Sprint deliverables

* Canvas foundation specification pack
* Public contracts for canvas and controller infrastructure
* BDD tests for canvas registration, rendering, hit testing, and event routing

---

# Sprint 2: Coordinate System Core

## Goal

Introduce the first usable plotting system:

* coordinate system
* axis objects
* coordinate mapping
* point domain model
* axis range changes

This sprint turns the canvas platform into a Cartesian plotting surface.

## Delivery specification scope

Deliver the following behaviors from the master specification:

* CoordinateSystem participates as a CanvasObject
* CoordinateSystem composed from Axis objects
* CoordinateSystem derives domain from axis ranges
* CoordinateSystem default ranges
* CoordinateSystem renders its axes
* CoordinateSystem reacts to axis range changes
* Coordinate container holds domain points
* Axis initializes with default range
* Axis renders as SVG
* Axis endpoints are interactive
* Axis contains TickSvg objects
* Axis composition
* Point is a domain object
* Point stores Cartesian position
* Point is mapped to SVG coordinates
* Point responds to range changes
* Point supports hit testing
* CoordinateSystem owns a MappingController
* MappingController maps Cartesian to SVG
* MappingController maps SVG to Cartesian
* MappingController preserves round-trip consistency
* MappingController reacts to range changes
* Range change begins from axis endpoint

## Implementation backlog

* Implement `CoordinateSystem` as a `CanvasObject`
* Implement horizontal and vertical `Axis`
* Implement axis range value model with invariants
* Implement tick generation at deterministic intervals
* Implement endpoint handle interaction model
* Implement `MappingController`
* Add coordinate container for domain `Point` objects
* Implement mapped point visual rendering owned by `CoordinateSystem`
* Implement hit testing for rendered points in SVG space
* Implement `OnRangeChangeController`

## Sprint exit criteria

* A coordinate system renders inside the canvas
* Both axes render with default range `[-10, 10]`
* Domain points render from Cartesian coordinates through `MappingController`
* Axis endpoint dragging updates axis range safely
* Range changes recompute mapped positions on the next render cycle

## Sprint deliverables

* Coordinate system core specification pack
* Public contracts for `CoordinateSystem`, `Axis`, `Point`, and `MappingController`
* BDD tests for mapping, axis behavior, and point remapping

---

# Sprint 3: SVG Composition and Styling System

## Goal

Standardize rendering architecture so visuals are composable, token-driven, and implementation-safe.

This sprint focuses on structural correctness rather than adding advanced plot types first.

## Delivery specification scope

Deliver the following behaviors from the master specification:

* All CanvasObjects are SVG-backed
* Primitive SVG objects exist
* Composition rule
* CoordinateSystem renders inside SVG
* Styling constraint
* Token-based styling
* Style states
* Builders create primitives
* Builder output is immutable
* Factory composition
* Factory extensibility
* Controlled element count
* Template composition
* Behavior isolation
* Controller extension
* Composition extension
* No behavior leakage

## Implementation backlog

* Implement SVG primitives: `Line`, `Circle`, `Rectangle`, `Arrow`
* Introduce `TickSvg` composition
* Implement builder classes for primitives
* Implement factory classes for composed visuals
* Move complex visual assembly to templates and factories
* Integrate `core-style-system` tokens into all rendering
* Add `Normal` and `Highlighted` visual states
* Refactor rendering so behavior stays in controllers
* Minimize unnecessary LitElement count

## Sprint exit criteria

* All rendering is SVG-based and primitive-composed
* Styling is token-driven and does not rely on CSS or inline style policy
* Primitive construction and composed visual construction follow builder and factory rules
* Behavior remains isolated in controllers

## Sprint deliverables

* SVG and styling architecture specification pack
* Public contracts for primitives, builders, and factories
* BDD tests for rendering composition, styling resolution, and factory behavior

---

# Sprint 3.1: Interaction Routing and Spatial Selection

## Goal

Introduce a clean interaction-routing layer so selection and highlighting work consistently across
axes and other `CanvasObject`s without overloading `MouseController`.

This stage focuses on interaction architecture, click selection, highlighted style state, and
faster hit-detection infrastructure.

## Delivery specification scope

Deliver or complete the following behaviors from the master specification:

* Click selects top-most object
* Canvas delegates behavior to controllers
* CanvasObject interaction opt-in
* Drag start
* Drag move
* Axis endpoints are interactive
* Range change begins from axis endpoint
* Style states
* Token-based styling

## Implementation backlog

* Keep `MouseController` limited to pointer collection and normalization
* Use a single DOM event boundary at `PlotCanvasElement` or the root SVG
* Avoid listener sprawl:
  * no per-`CanvasObject` DOM listeners
  * no per-primitive SVG listeners
  * no duplicate raw pointer listeners across controllers
* Introduce a dedicated hit-test/query service for interaction routing
* Introduce a spatial index abstraction for broad-phase lookup
* Integrate `@monorepo/core-design-pattern-quad-tree` as the broad-phase spatial index
* Preserve exact `CanvasObject.hitTest(...)` as the final interaction truth
* Make `OnClickController` the first completed semantic interaction controller
* Store selected `CanvasObject` identity explicitly at canvas level
* Apply highlighted style tokens when a clickable `CanvasObject` is selected
* Ensure the same highlight mechanism works for `Axis` and other clickable `CanvasObject`s
* Introduce axis endpoint handles or endpoint hit regions as explicit interactive targets
* Support drag-move interaction for draggable `CanvasObject`s through `DragController`
* Support `OnDrag` operation semantics so a draggable `CanvasObject` can be repositioned through drag lifecycle events
* Reuse the same target-resolution architecture for axis interaction:
  * `MouseController` provides normalized pointer state
  * hit-test/query service resolves the endpoint target
  * `DragController` owns drag lifecycle
  * `OnRangeChangeController` interprets drag movement as axis interval or range change
* Define axis interval drag semantics as scale-style interval change:
  * dragging to the right increases the visible interval
  * dragging to the left decreases the visible interval
  * short drags apply a smaller factor
  * longer drags apply a broader factor
  * example: `[-10, 10]` dragged right may become approximately `[-15, 15]`
* Ensure axis interval updates trigger remapping of ticks, grid, snap, and plotted visuals
* Add unit tests for click routing, selection state, highlight state, and quad-tree-backed candidate lookup
* Defer `DragOperation` object refactoring until Sprint 5 together with FSM-based drag lifecycle modeling

## Sprint exit criteria

* `MouseController` is not the master for all interactivity
* Raw DOM event listening is centralized and not duplicated across the object model
* Click routing uses a dedicated hit-test/query path
* Broad-phase candidate lookup is accelerated through the quad-tree integration
* Selected `CanvasObject`s render with highlighted token-driven style
* The same interaction model applies to axes and other clickable canvas objects
* Draggable `CanvasObject`s can be repositioned through `DragController` and `OnDrag` behavior
* Axis endpoint drag is modeled through `DragController` plus `OnRangeChangeController`, not through raw event handling on the axis itself
* Dragging axis interval handles to the right expands the interval and dragging left contracts it using a deterministic factor-based rule

## Sprint deliverables

* Interaction routing specification pack
* Public contracts for hit-test/query and spatial index services
* BDD and unit tests for click selection, highlighting, and spatial candidate resolution

---

# Sprint 4: Geometry and Advanced Plotting

## Goal

Deliver advanced plotting capability on top of the stable platform:

* interpolation
* rectangles
* geometry subsystem
* geometry-backed hit testing

This sprint completes the plotting feature set defined by the specification.

## Delivery specification scope

Deliver the following behaviors from the master specification:

* Interpolation uses core-math
* Interpolation occurs in Cartesian space
* Interpolated curve is deterministic
* Insufficient interpolation input handled safely
* Curve updates when a point changes
* Curve remaps on axis-range change
* Rectangle uses Cartesian coordinates as source of truth
* Rectangle geometry is mapped to SVG
* Rectangle remaps when axis ranges change
* Geometry objects exist
* Path builder produces valid paths
* Curve operations are deterministic
* Hit testing uses geometry

## Implementation backlog

* Integrate `core-math` interpolation functions
* Adopt `core-math` geometry types intentionally:
  * `Point2` for stored coordinate positions
  * `Vector2` for deltas, directions, tangents, and normals
  * `BoundingBox2D` for hit testing and view bounds
* Add curve representation in Cartesian space
* Map curve geometry through `MappingController`
* Recompute curves when source point data changes
* Add rectangle domain and rendered geometry support
* Add geometry primitives and path model
* Implement path builder
* Implement geometry-based hit testing with tolerance rules
* Add deterministic curve operations such as point-at-t, tangent, normal, and length

## Sprint exit criteria

* Curves are computed in Cartesian space and rendered through mapped SVG geometry
* Rectangles render deterministically from Cartesian source data
* Core plotting geometry uses `core-math` types consistently where semantics matter
* Geometry primitives support path validity and reusable hit testing
* Advanced plotted geometry remains stable under axis range changes

## Sprint deliverables

* Advanced plotting specification pack
* Public contracts for geometry and path abstractions
* BDD tests for interpolation, rectangle remapping, and geometry hit testing

---

# Sprint 5: Plot Menu and Equation Input

## Goal

Introduce a plot-authoring menu system connected to an active `CoordinateSystem` so users can add,
edit, select, toggle, and remove plots through a dedicated left-side menu and custom input control.

This sprint focuses on plot management workflow rather than low-level geometry primitives.

## Delivery specification scope

Deliver the following behaviors as new specification-backed features:

* CoordinateSystem hosts an interactive plot menu
* Plot menu lists active plots in deterministic order
* Plot menu adds a new plot from custom input control text
* Plot menu supports equation-driven plot creation
* Selected plot row highlights the plotted object in the coordinate system
* Selected plotted object highlights the plot row in the menu
* Plot visibility can be toggled without deletion
* Plot can be removed from the registry
* Invalid plot input is handled safely

## Implementation backlog

* Introduce `PlotRegistry` for active plots
* Introduce `PlotDefinition` or equivalent typed plot model
* Introduce `PlotFactory` for creating plots from typed commands
* Introduce `PlotParser` for translating input text into plot definitions
* Introduce `PlotMenuController` for add/select/toggle/delete actions
* Introduce `PlotMenuElement` as the left-side plot menu
* Introduce a custom `PlotInputControl` for equation or plot definition entry
* Connect menu selection and coordinate-system highlight state bidirectionally
* Support initial plot types:
  * vertical line: `x = c`
  * horizontal line: `y = c`
  * function: `y = f(x)`
  * points
  * circle
  * segment or polyline
* Ensure new plots are registered into the active `CoordinateSystem` and rerender deterministically
* Refactor pointer-driven drag lifecycle onto `@monorepo/core-fsm`
* Introduce an explicit drag session FSM for:
  * `idle`
  * `pressed`
  * `dragging`
  * completion and cancellation transitions
* Introduce `DragOperation` objects initialized by `DragController`
* Separate drag lifecycle concerns from drag semantics:
  * `DragController` owns FSM and pointer inputs
  * `DragOperation` owns move, interval-scale, and future drag meanings
* Support deterministic drag interruption through FSM transitions for:
  * `Escape`
  * competing pointer intent
  * `pointercancel`
  * `lostpointercapture`
* Add unit and BDD tests for plot creation, registry updates, selection synchronization, and invalid input handling
* Expand automated test coverage to a high-confidence level:
  * one focused test file per object or controller where practical
  * shared fixtures for dry setup
  * positive and negative behavioral cases
  * regression tests for fixed bugs
  * stronger coverage for controllers, `PlotCanvasElement`, geometry, mapping, style-driven composition, and menu workflows

## Sprint exit criteria

* The active `CoordinateSystem` can receive plots from a left-side menu workflow
* A custom input control can add a plot from equation text
* Plot menu and plotted output remain synchronized for selection and visibility
* Plot registry order is deterministic
* Invalid plot input does not destabilize the canvas or registry
* Drag lifecycle is modeled explicitly through `core-fsm` and supports deterministic complete vs cancel behavior
* Automated tests provide high-confidence coverage for core runtime behavior, menu workflows, and known regressions

## Sprint deliverables

* Plot menu specification pack
* Public contracts for plot registry, parser, factory, and menu controller
* BDD and unit tests for menu-driven plot authoring, synchronization, and broader high-confidence runtime coverage

---

# Delivery Order Rationale

## Why this order

Sprint 1 delivers the minimum runtime platform.

Sprint 2 delivers the first real plot feature set.

Sprint 3 hardens the rendering architecture so later additions do not create structural debt.

Sprint 4 adds advanced plotting and geometry once mapping, rendering, and interaction are already stable.

## Dependency chain

* Sprint 2 depends on Sprint 1
* Sprint 3 depends on Sprint 1 and partially on Sprint 2
* Sprint 4 depends on Sprints 1 through 3

---

# Suggested Delivery Artifacts Per Sprint

Each sprint should produce:

* one sprint specification document derived from `master.spsification.txt`
* public TypeScript contracts for the sprint scope
* BDD tests proving the sprint scenarios
* implementation code matching the contracts

Recommended sprint documents:

* `sprint-1-canvas-foundation.spec.md`
* `sprint-2-coordinate-system-core.spec.md`
* `sprint-3-svg-and-styling.spec.md`
* `sprint-4-advanced-plotting.spec.md`

---

# Sprint 6: Composition Evaluation and Visual Tree Reuse

## Goal

Evaluate whether selected composition concepts or limited components from
`@monorepo/core-composition-svg` should be reused in `core-plot` for complex SVG composition,
visual-tree structuring, or hit metadata support without replacing the existing Lit/controller
architecture.

## Implementation note

* Evaluate `@monorepo/core-composition-svg` as a selective source of reuse
* Reuse only where it improves `core-plot` without taking over the runtime model
* Candidate reuse areas:
  * composite SVG composition patterns
  * bounding-box metadata and pruning concepts
  * primitive composition support for complex visuals
* Explicitly avoid direct wholesale adoption of:
  * `SceneRenderer` as the main render loop
  * DOM-owned behavior routing in place of controllers
  * replacing the existing Lit-based `CanvasObject` architecture
