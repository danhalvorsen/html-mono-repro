# `@monorepo/core-plot`

## Canonical Specification

This document is the single source of truth for `packages/core-plot/src`.

It consolidates and supersedes:

* `spesifications.md`
* `spesifications cartesian coordinate system.md`
* `appendix.specs.md`
* `spesification.for.ai.md`

This document defines both:

* the product behavior specification
* the mandatory engineering rules for implementation

If older documents conflict with this one, this document wins.

---

# 1. Scope

The `core-plot` module shall provide:

* a plotting canvas built with Lit 3
* SVG-based rendering only
* a Cartesian coordinate system
* controller-based interaction behavior
* deterministic rendering and interaction behavior
* strict separation between orchestration, behavior, domain data, and rendering

This is the authoritative behavior and engineering specification for the module.

---

# 2. Architectural Truth

## 2.1 Composition root

The system composition root is:

* `PlotCanvasElement`

It owns:

* canvas state
* object registry
* render orchestration
* reactive controllers

It shall orchestrate only.

It shall not embed object-specific interaction policy.

## 2.2 Layer responsibilities

The architecture shall follow this separation:

* Canvas orchestrates
* Controllers handle behavior
* Domain objects hold data
* SVG components render

No layer shall violate this separation.

## 2.3 Canonical object model

The canonical model is:

* `PlotCanvasElement` is the host web component and composition root
* `CoordinateSystem` is a `CanvasObject`
* `Axis` is a `CanvasObject`
* `Point` is a domain object, not a `CanvasObject`
* `MappingController` is a Lit reactive controller

This resolves the earlier contradiction about `Point`.

---

# 3. Core Domain Contracts

## 3.1 `CanvasObject`

A `CanvasObject` is a renderable and optionally interactive object hosted by `PlotCanvasElement`.

It shall support:

* stable identity
* deterministic rendering
* hit testing
* optional interaction participation

### Scenario: CanvasObject identity is stable

```gherkin
Given a CanvasObject has been created
When the system reads the object's id multiple times
Then the id shall remain unchanged
And the id shall uniquely identify that object within the canvas
```

### Scenario: CanvasObject participates in render cycle

```gherkin
Given a CanvasObject is registered in the canvas
When the render cycle executes
Then the object shall be rendered
And it shall receive the render context supplied by the canvas
```

### Scenario: CanvasObject supports hit testing

```gherkin
Given a pointer position in canvas coordinates
When hit testing is performed against a CanvasObject
Then the object shall return true only if the point intersects its interactive geometry
And false otherwise
```

### Scenario: CanvasObject interaction opt-in

```gherkin
Given a CanvasObject is registered in the canvas
When the object does not support a specific interaction
Then the system shall not invoke that interaction contract on the object
And the canvas shall remain stable
```

---

# 4. PlotCanvasElement

`PlotCanvasElement` is the composition root and host web component.

### Scenario: Canvas initializes required controllers

```gherkin
Given the PlotCanvasElement is connected to the DOM
When initialization completes
Then the canvas shall create and register:
  - MouseController
  - DragController
  - GridController
  - SnapController
  - OnClickController
  - OnDoubleClickController
  - OnScaleController
  - OnRangeChangeController
```

### Scenario: Canvas maintains registered objects

```gherkin
Given one or more CanvasObjects are added to the canvas
When registration completes
Then the objects shall participate in rendering
And the objects shall participate in hit testing according to their capabilities
```

### Scenario: Canvas renders deterministically

```gherkin
Given the canvas contains multiple registered objects
When a render cycle executes
Then the objects shall be rendered in deterministic order
And repeated renders with unchanged state shall produce the same visual result
```

### Scenario: Canvas delegates behavior to controllers

```gherkin
Given a user interaction occurs on the canvas
When the event is processed
Then PlotCanvasElement shall delegate the behavior to the appropriate controller
And shall not directly implement interaction-specific policy
```

---

# 5. Interaction Controllers

Reactive controllers encapsulate behavior and lifecycle integration.

## 5.1 MouseController

`MouseController` owns event collection and normalization.

### Scenario: MouseController tracks pointer position

```gherkin
Given the pointer moves within the canvas area
When a pointer move event occurs
Then MouseController shall update the current pointer position
And the position shall be represented in canvas coordinates
```

## 5.2 DragController

`DragController` owns drag lifecycle management.

### Scenario: Drag start

```gherkin
Given a draggable CanvasObject is under the pointer
And the primary pointer button is pressed
When movement exceeds the drag threshold
Then DragController shall start a drag operation
And the object shall become the active drag target
```

### Scenario: Drag move

```gherkin
Given a drag operation is active
When the pointer moves
Then DragController shall compute drag delta
And publish drag move updates to the active target
```

## 5.3 SnapController

`SnapController` maps free interaction positions to snapped positions.

### Scenario: Snap to grid

```gherkin
Given snapping is enabled
And a pointer position is evaluated
When SnapController processes the position
Then it shall return the nearest valid snap position on the grid
```

## 5.4 OnClickController

### Scenario: Click selects top-most object

```gherkin
Given one or more clickable CanvasObjects exist under the pointer
When the user performs a single click
Then OnClickController shall resolve the top-most eligible object
And raise click behavior for that object
```

## 5.5 OnDoubleClickController

### Scenario: Double click

```gherkin
Given a double-clickable CanvasObject exists under the pointer
When the user performs a valid double-click gesture
Then OnDoubleClickController shall invoke double-click behavior for that object
```

## 5.6 OnScaleController

### Scenario: Scale interaction

```gherkin
Given a scalable CanvasObject exists
When a valid scale gesture begins on that object
Then OnScaleController shall start a scale interaction
```

## 5.7 OnRangeChangeController

`OnRangeChangeController` is axis-specific interaction policy.

### Scenario: Range change begins from axis endpoint

```gherkin
Given an Axis object is rendered with interactive endpoint handles
And the user presses on one endpoint handle
When DragController starts a drag operation for that handle
Then OnRangeChangeController shall start an axis range change operation
```

---

# 6. Coordinate System

`CoordinateSystem` is a `CanvasObject` composed from:

* one horizontal axis
* one vertical axis
* one mapping controller
* a coordinate container for domain points
* zero or more rendered geometric outputs

### Scenario: CoordinateSystem participates as a CanvasObject

```gherkin
Given a CoordinateSystem is registered in the canvas
When the canvas render cycle executes
Then the CoordinateSystem shall participate as a CanvasObject
And it shall render its internal visual structure deterministically
```

### Scenario: CoordinateSystem composed from Axis objects

```gherkin
Given a CoordinateSystem has been created
When initialization completes
Then it shall contain one horizontal Axis CanvasObject
And one vertical Axis CanvasObject
```

### Scenario: CoordinateSystem derives domain from axis ranges

```gherkin
Given a CoordinateSystem contains a horizontal axis and a vertical axis
When coordinate mapping is evaluated
Then the horizontal axis range shall define the x-domain
And the vertical axis range shall define the y-domain
```

### Scenario: CoordinateSystem default ranges

```gherkin
Given a CoordinateSystem is created without explicit axis ranges
When initialization completes
Then both axes shall have range [-10, 10]
```

### Scenario: CoordinateSystem renders its axes

```gherkin
Given a CoordinateSystem is active
When the CoordinateSystem renders
Then it shall render both axis objects
And the axis rendering shall reflect their current ranges
```

### Scenario: CoordinateSystem reacts to axis range changes

```gherkin
Given the CoordinateSystem contains one or more plotted objects
When an Axis range changes
Then the CoordinateSystem shall recompute coordinate mapping
And dependent SVG positions shall update on the next render cycle
```

### Scenario: Coordinate container holds domain points

```gherkin
Given a CoordinateSystem is initialized
When points are added to the system
Then the CoordinateSystem shall store them in a coordinate container
And the container shall be the single source of truth for all points
```

---

# 7. Axis

An `Axis` is a `CanvasObject` with:

* orientation
* numeric range
* SVG rendering
* interactive endpoint behavior

Default range:

* `[-10, 10]`

### Scenario: Axis initializes with default range

```gherkin
Given an Axis object is created without an explicit range
When initialization completes
Then the Axis range shall be [-10, 10]
```

### Scenario: Axis renders as SVG

```gherkin
Given an Axis object is registered in the canvas
When the canvas render cycle executes
Then the Axis shall render as SVG geometry
And the rendered geometry shall represent the current axis range
```

### Scenario: Axis endpoints are interactive

```gherkin
Given an Axis object is rendered
When the end-user interacts with an endpoint handle
Then the endpoint shall participate in axis range change behavior
```

### Scenario: Axis contains TickSvg objects

```gherkin
Given an Axis is rendered
When the render cycle executes
Then the Axis shall render TickSvg objects
And each TickSvg shall represent a value in the axis domain
```

### Scenario: Axis composition

```gherkin
Given an Axis is rendered
When its structure is evaluated
Then it shall consist of:
  - one line primitive
  - one arrow primitive
  - multiple TickSvg primitives
```

---

# 8. Point

`Point` is a coordinate-system domain object.

It is not a `CanvasObject`.

It does not render itself directly.

Its Cartesian position is the source of truth.

### Scenario: Point is a domain object

```gherkin
Given a Point exists in the CoordinateSystem
When the system evaluates its type
Then the Point shall be a domain object
And it shall not be a CanvasObject
And it shall not implement rendering behavior directly
```

### Scenario: Point stores Cartesian position

```gherkin
Given a Point exists in the CoordinateSystem
When the system queries its position
Then the Point shall expose its position in Cartesian coordinates
And that position shall be the source of truth for mapping
```

### Scenario: Point is mapped to SVG coordinates

```gherkin
Given a Point has a Cartesian position
When the Point is rendered
Then the CoordinateSystem shall use MappingController to obtain the SVG position
And the rendered point shall appear at that mapped location
```

### Scenario: Point responds to range changes

```gherkin
Given a Point exists at a fixed Cartesian position
When one or both axis ranges change
Then the Point's Cartesian position shall remain unchanged
And its SVG render position shall be recomputed from the new mapping
```

### Scenario: Point supports hit testing

```gherkin
Given a Point is rendered in the CoordinateSystem
When the user interacts near the rendered point
Then hit testing shall evaluate against the rendered SVG-space geometry
And the correct Point shall be resolved as the target when intersected
```

---

# 9. MappingController

`MappingController` is the sole mapping policy owner for:

* Cartesian to SVG mapping
* SVG to Cartesian mapping
* axis-range-aware coordinate transformation

It participates through the Lit reactive controller mechanism.

### Scenario: CoordinateSystem owns a MappingController

```gherkin
Given a CoordinateSystem is initialized
When initialization completes
Then it shall create and register a MappingController
And the MappingController shall participate through the Lit reactive controller mechanism
```

### Scenario: MappingController maps Cartesian to SVG

```gherkin
Given a Cartesian point within the current axis ranges
When MappingController maps the point to view coordinates
Then it shall return a deterministic SVG coordinate
And that coordinate shall be consistent with the current axis ranges and viewport bounds
```

### Scenario: MappingController maps SVG to Cartesian

```gherkin
Given an SVG coordinate inside the CoordinateSystem viewport
When MappingController maps the coordinate to Cartesian space
Then it shall return the corresponding Cartesian coordinate
And the result shall be consistent with the current axis ranges
```

### Scenario: MappingController preserves round-trip consistency

```gherkin
Given a Cartesian point in the coordinate system
When it is mapped to SVG coordinates
And then mapped back to Cartesian coordinates
Then the resulting Cartesian point shall equal the original point within numeric tolerance
```

### Scenario: MappingController reacts to range changes

```gherkin
Given MappingController is active
When the horizontal or vertical axis range changes
Then MappingController shall use the updated ranges for all future coordinate transformations
```

---

# 10. Curves and Rectangles

## 10.1 Curve interpolation

Interpolation shall:

* use the existing `core-math` interpolation functions
* use the existing `core-math` point or vector2 types as mathematical inputs
* occur in Cartesian space
* render through mapped SVG geometry

### Scenario: Interpolation uses core-math

```gherkin
Given a series of CoordinateSystem points exists
When the CoordinateSystem interpolates a curve
Then it shall use the existing core-math interpolation functions
And it shall use the existing core-math point or vector2 types as the mathematical input model
```

### Scenario: Interpolation occurs in Cartesian space

```gherkin
Given a series of CoordinateSystem points exists
When curve interpolation is performed
Then interpolation shall be calculated in Cartesian coordinates
And the resulting curve geometry shall then be mapped to SVG coordinates for rendering
```

### Scenario: Interpolated curve is deterministic

```gherkin
Given the same ordered series of CoordinateSystem points
When interpolation is performed multiple times with unchanged inputs
Then the resulting interpolated curve geometry shall be identical
```

### Scenario: Insufficient interpolation input handled safely

```gherkin
Given fewer than the minimum required points for the chosen interpolation algorithm
When interpolation is requested
Then the system shall remain stable
And it shall not publish invalid curve geometry
```

### Scenario: Curve updates when a point changes

```gherkin
Given an interpolated curve has been created from a point series
When one of the source points changes its Cartesian position
Then the CoordinateSystem shall recompute the interpolation result
And the rendered curve shall update accordingly
```

### Scenario: Curve remaps on axis-range change

```gherkin
Given an interpolated curve exists in Cartesian space
When one or both axis ranges change
Then the interpolation result in Cartesian space shall remain unchanged
And its rendered SVG geometry shall be recomputed through MappingController
```

## 10.2 Rectangles

Rectangles use Cartesian coordinates as the source of truth.

### Scenario: Rectangle uses Cartesian coordinates as source of truth

```gherkin
Given a rectangle is defined in the CoordinateSystem
When the rectangle is stored by the system
Then its geometric definition shall be stored in Cartesian coordinates
And SVG coordinates shall be derived through MappingController
```

### Scenario: Rectangle geometry is mapped to SVG

```gherkin
Given a rectangle exists in Cartesian space
When the CoordinateSystem renders the rectangle
Then each rectangle boundary coordinate shall be transformed through MappingController
And the resulting SVG rectangle geometry shall be rendered deterministically
```

### Scenario: Rectangle remaps when axis ranges change

```gherkin
Given a rectangle exists in Cartesian space
When one or both axis ranges change
Then the rectangle's Cartesian geometry shall remain unchanged
And its rendered SVG geometry shall be recalculated from the new mapping
```

---

# 11. SVG System

All visual rendering shall be SVG-based.

### Scenario: All CanvasObjects are SVG-backed

```gherkin
Given a CanvasObject exists
When it renders
Then it shall render using SVG primitives
And it shall not use non-SVG rendering mechanisms
```

### Scenario: Primitive SVG objects exist

```gherkin
Given the SVG subsystem is initialized
When primitives are required
Then the system shall provide Line, Circle, Rectangle, and Arrow primitives as Lit components
```

### Scenario: Composition rule

```gherkin
Given a complex SVG object is created
When its structure is evaluated
Then it shall be composed of primitive SVG elements
And it shall not reimplement primitive geometry logic
```

### Scenario: CoordinateSystem renders inside SVG

```gherkin
Given the CoordinateSystem is hosted by the canvas
When the component renders
Then the coordinate system visual output shall be rendered as SVG content
And its child geometry shall be composed within that SVG structure
```

---

# 12. Styling System

Styling shall use `core-style-system` exclusively.

No CSS files, inline styles, or `<style>` blocks shall be used for visual styling policy.

### Scenario: Styling constraint

```gherkin
Given any SVG or CanvasObject
When styling is applied
Then it shall use the core-style-system exclusively
And no CSS file or inline style shall be used
```

### Scenario: Token-based styling

```gherkin
Given an SVG object is rendered
When visual properties are applied
Then styling shall be resolved via token keys
And those tokens shall come from the core-style-system
```

### Scenario: Style states

```gherkin
Given an SVG object exists
When its visual state changes
Then it shall support:
  - Normal state
  - Highlighted state
And the style shall be resolved through tokens
```

---

# 13. Builders and Factories

Builders and factories are part of the required construction model.

## 13.1 Builder rules

Builders:

* must be classes
* use `withX(...)` fluent methods where applicable
* enforce invariants
* end in `build()` or `create()`

Primitive builders shall exist for SVG primitives.

### Scenario: Builders create primitives

```gherkin
Given a builder for an SVG primitive
When build() is invoked
Then it shall return a fully constructed SVG object
And the object shall be valid for rendering
```

### Scenario: Builder output is immutable

```gherkin
Given a builder produces an SVG object
When the object is returned
Then its configuration shall be immutable
And mutation shall require a new builder instance
```

## 13.2 Factory rules

Factories:

* must be classes
* encapsulate object graph creation
* use constructor injection
* compose higher-level objects from primitives

### Scenario: Factory composition

```gherkin
Given a factory is used to create a complex SVG object
When the factory executes
Then it shall compose the object from primitive SVG elements
And it shall not embed rendering logic directly
```

### Scenario: Factory extensibility

```gherkin
Given a new SVG composition is required
When extending the system
Then a new factory shall be introduced
And existing factories shall not be modified
```

---

# 14. Lit 3 Usage Rules

The rendering system shall minimize the number of LitElements and prefer templates for composition.

Behavior concerns shall be implemented as reactive controllers.

### Scenario: Controlled element count

```gherkin
Given the rendering system
When composing SVG structures
Then the number of LitElements shall be minimized
And templates shall be used for composition where possible
```

### Scenario: Template composition

```gherkin
Given a composite SVG object
When rendering occurs
Then it may be composed using Lit templates
And not require a dedicated LitElement per sub-element
```

### Scenario: Behavior isolation

```gherkin
Given an interaction or behavior concern
When it is implemented
Then it shall be encapsulated in a reactive controller
And not embedded directly in the LitElement
```

---

# 15. Poly-System Geometry

The geometry subsystem shall provide:

* `Point2D`
* `Vector2D`
* `Bounds`
* `Size2D`
* `Transform2D`
* `PathSegment`
* `Polyline`
* `Polygon`
* `BezierCurve`
* `Arc`

### Scenario: Geometry objects exist

```gherkin
Given the geometry subsystem is initialized
When geometry primitives are required
Then the system shall provide:
  - Point2D
  - Vector2D
  - Bounds
  - Size2D
  - Transform2D
  - PathSegment
  - Polyline
  - Polygon
  - BezierCurve
  - Arc
```

### Scenario: Path builder produces valid paths

```gherkin
Given a path builder is used
When build() is invoked
Then the resulting path shall be structurally valid
And its segments shall follow SVG path semantics
```

### Scenario: Curve operations are deterministic

```gherkin
Given a curve exists
When point-at-t, tangent, normal, or length operations are evaluated
Then the results shall be deterministic
And consistent across repeated evaluations
```

### Scenario: Hit testing uses geometry

```gherkin
Given a shape is rendered
When hit testing occurs
Then hit testing shall evaluate against geometric bounds or curve distance
And shall respect tolerance rules
```

---

# 16. Open–Closed Principle

The system shall be extended by addition, not by modifying established primitives or controllers without need.

### Scenario: Controller extension

```gherkin
Given new interaction behavior is required
When the system is extended
Then a new reactive controller shall be introduced
And existing controllers shall not be modified
```

### Scenario: Composition extension

```gherkin
Given new visual structures are required
When extending the system
Then new compositions shall be built from primitives
And existing primitives shall remain unchanged
```

### Scenario: No behavior leakage

```gherkin
Given the system architecture
When responsibilities are evaluated
Then:
  - Canvas orchestrates
  - Controllers handle behavior
  - Domain objects hold data
  - SVG components render
And no layer shall violate this
```

---

# 17. Engineering Rules

These rules are mandatory for all implementation and generated code in this module.

## 17.1 Delivery expectations

All delivered code must be:

* strictly object-oriented and class-based where behavior lives
* SOLID compliant
* deterministic
* production-grade
* testable
* maintainable
* cohesive
* extension-friendly
* minimal in public surface area

Do not generate:

* demo code
* placeholder implementations
* pseudo-logic
* hidden globals
* service locator patterns
* speculative abstractions

## 17.2 OOP enforcement

Mandatory:

* use classes and interfaces for behavior-bearing components
* behavior must live on objects, not free functions
* orchestration must be handled by objects
* composition must be explicit

Prohibited:

* free functions for domain behavior
* top-level factory functions
* functional orchestration where OOP is viable
* module-level composition

## 17.3 Composition root rules

Mandatory:

* composition must be encapsulated in a class
* dependency wiring must be explicit
* constructors must receive abstractions
* object graph creation must be visible

Preferred naming:

* `DefaultXFactory`
* `XCompositionRoot`
* `XBuilder`

## 17.4 Public API rules

Mandatory:

* export classes, interfaces, and value objects
* expose behavior through methods
* keep API surface minimal

Prohibited:

* exported free-function facades
* function-first APIs

## 17.5 Type safety rules

Mandatory:

* no magic strings in domain logic
* all domain values must be type-safe

Allowed mechanisms, in order:

1. constant
2. const object plus union
3. enum or const enum
4. value object or class
5. polymorphic abstraction

## 17.6 Dependency injection rules

* constructor injection is required
* depend on abstractions
* no service locator
* no hidden dependency resolution
* no static mutable state

## 17.7 Testing rules

Mandatory:

* test public behavior only
* use fixtures for setup
* use positive and negative tests
* use BDD naming conventions such as `should ...`
* keep tests deterministic

Prohibited:

* testing private implementation details
* function-centered testing unless unavoidable

## 17.8 Enforcement policy

* ESLint and TypeScript shall enforce mechanical rules where possible
* passing lint does not prove compliant architecture
* passing tests does not prove SOLID compliance
* code review remains authoritative

## 17.9 Core module usage

Use these supporting modules where applicable:

* `core.logging` for logging
* `core.spesification` for specification support
* `core.spesification.rules` for rule and validation separation
* `core-design-patterns` for architectural guidance
* `core-testing` for testing utilities and fixtures

---

# 18. Summary of Authoritative Types

## Web component

* `PlotCanvasElement`

## Canvas objects

* `CanvasObject`
* `CoordinateSystem`
* `Axis`

## Domain objects

* `Point`

## Controllers

* `MouseController`
* `DragController`
* `GridController`
* `SnapController`
* `OnClickController`
* `OnDoubleClickController`
* `OnScaleController`
* `OnRangeChangeController`
* `MappingController`

## SVG primitives

* `Line`
* `Circle`
* `Rectangle`
* `Arrow`

## Geometry primitives

* `Point2D`
* `Vector2D`
* `Bounds`
* `Size2D`
* `Transform2D`
* `PathSegment`
* `Polyline`
* `Polygon`
* `BezierCurve`
* `Arc`
