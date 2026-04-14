# `@monorepo/core-plot`

## 4-Sprint Backlog

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
* Geometry primitives support path validity and reusable hit testing
* Advanced plotted geometry remains stable under axis range changes

## Sprint deliverables

* Advanced plotting specification pack
* Public contracts for geometry and path abstractions
* BDD tests for interpolation, rectangle remapping, and geometry hit testing

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
