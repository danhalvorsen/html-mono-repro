# `@monorepo/core-plot`

## Coordinate System Given–When–Then Specification

This document extends the canvas specification with a **CoordinateSystem** canvas object, **Axis** canvas objects, **Point** canvas objects, and a **MappingController** implemented as a Lit reactive controller. In Lit, reactive controllers are intended to package reusable state, behavior, and lifecycle hooks for a feature, which fits the controller responsibilities defined below. Also, in Lit, the outer `<svg>` element belongs in an `html` template, while SVG fragments can be composed inside it. ([lit.dev][1])

---

# 1. Scope

The coordinate system subsystem shall provide:

* a `CoordinateSystem` as a `CanvasObject`
* two `Axis` canvas objects used to build the coordinate system
* a `Point` canvas object plotted into the coordinate system
* a `MappingController` that maps:

  * Cartesian coordinates → SVG coordinates
  * SVG coordinates → Cartesian coordinates
* interpolation of a curve through a series of coordinate-system points
* drawing of rectangles through the coordinate system using mapped coordinates
* reuse of the existing `core-math` library for:

  * interpolation
  * point object
  * vector2 object

This is a **behavior specification**, not an implementation.

---

# 2. Architectural Intent

## 2.1 Composition Model

The architecture shall be layered as follows:

* `PlotCanvasElement` is the composition root
* `CoordinateSystem` is a `CanvasObject`
* `CoordinateSystem` is built around two `Axis` canvas objects
* `Point` is a `CanvasObject`
* `MappingController` is a Lit reactive controller attached to the coordinate-system host
* interpolation behavior belongs to the coordinate-system domain
* rendering uses SVG

---

# 3. Primary Object Model

## 3.1 `CoordinateSystem`

A `CoordinateSystem` is a `CanvasObject` composed from:

* one horizontal axis
* one vertical axis
* one mapping controller
* zero or more plotted points
* zero or more interpolated geometric outputs
* zero or more rectangles rendered in coordinate-system space

---

## 3.2 `Axis`

An `Axis` is a `CanvasObject` with:

* orientation
* numeric range
* SVG rendering
* interactive range behavior

Default axis range:

* `[-10, 10]`

---

## 3.3 `Point`

A `Point` is a `CanvasObject` representing a coordinate-system point.

A point shall have:

* stable identity
* Cartesian position
* mapped SVG position
* deterministic rendering
* hit testing

---

## 3.4 `MappingController`

The `MappingController` is responsible for coordinate transformation between Cartesian space and SVG space.

It shall be the sole mapping policy owner for:

* world-to-view conversion
* view-to-world conversion
* axis-range-aware coordinate translation

---

# 4. Coordinate System Object

## GWT — CoordinateSystem is a CanvasObject

**Scenario CS-001 — CoordinateSystem participates as a canvas object**

```gherkin
Given a CoordinateSystem is registered in the canvas
When the canvas render cycle executes
Then the CoordinateSystem shall participate as a CanvasObject
And it shall render its internal visual structure deterministically
```

---

## GWT — CoordinateSystem is built around two axis objects

**Scenario CS-002 — CoordinateSystem is composed from Axis objects**

```gherkin
Given a CoordinateSystem has been created
When initialization completes
Then it shall contain one horizontal Axis CanvasObject
And one vertical Axis CanvasObject
And both axes shall participate in rendering and interaction
```

---

## GWT — CoordinateSystem uses axis ranges as domain basis

**Scenario CS-003 — CoordinateSystem derives its domain from axis ranges**

```gherkin
Given a CoordinateSystem contains a horizontal axis and a vertical axis
When coordinate mapping is evaluated
Then the horizontal axis range shall define the x-domain
And the vertical axis range shall define the y-domain
```

---

## GWT — Default coordinate system ranges

**Scenario CS-004 — CoordinateSystem starts with default axis ranges**

```gherkin
Given a CoordinateSystem is created without explicit axis ranges
When initialization completes
Then the horizontal axis shall have range [-10, 10]
And the vertical axis shall have range [-10, 10]
```

---

# 5. Axis Integration

## GWT — Axis objects are rendered inside the coordinate system

**Scenario CS-010 — CoordinateSystem renders its axes**

```gherkin
Given a CoordinateSystem is active
When the CoordinateSystem renders
Then it shall render both axis objects
And the axis rendering shall reflect their current ranges
```

---

## GWT — Axis range changes update the coordinate system

**Scenario CS-011 — CoordinateSystem reacts to axis range changes**

```gherkin
Given the CoordinateSystem contains one or more plotted objects
When an Axis range changes
Then the CoordinateSystem shall recompute coordinate mapping
And dependent SVG positions shall be updated on the next render cycle
```

---

## GWT — Axis objects remain independent canvas objects

**Scenario CS-012 — Axis retains CanvasObject behavior**

```gherkin
Given an Axis belongs to a CoordinateSystem
When the canvas performs hit testing or interaction routing
Then the Axis shall still behave as a CanvasObject
And may participate in click, drag, scale, and range interaction according to its capabilities
```

---

# 6. Point CanvasObject

## GWT — Point is a CanvasObject

**Scenario CS-020 — Point participates as a canvas object**

```gherkin
Given a Point is registered in the CoordinateSystem
When the render cycle executes
Then the Point shall participate as a CanvasObject
And it shall render at its mapped SVG position
```

---

## GWT — Point stores Cartesian position

**Scenario CS-021 — Point is defined in Cartesian coordinates**

```gherkin
Given a Point exists in the CoordinateSystem
When the system queries its position
Then the Point shall expose its position in Cartesian coordinates
And that position shall be the source of truth for mapping
```

---

## GWT — Point is mapped to SVG coordinates

**Scenario CS-022 — Point is rendered through MappingController**

```gherkin
Given a Point has a Cartesian position
When the Point is rendered
Then the CoordinateSystem shall use MappingController to obtain the SVG position
And the rendered point shall appear at that mapped location
```

---

## GWT — Point responds to range changes

**Scenario CS-023 — Point moves visually when axis ranges change**

```gherkin
Given a Point exists at a fixed Cartesian position
When one or both axis ranges change
Then the Point's Cartesian position shall remain unchanged
And its SVG render position shall be recomputed from the new mapping
```

---

## GWT — Point supports hit testing

**Scenario CS-024 — Point can be hit tested in view space**

```gherkin
Given a Point is rendered in the CoordinateSystem
When the user interacts near the rendered point
Then hit testing shall evaluate against the rendered SVG-space geometry
And the correct Point shall be resolved as the target when intersected
```

---

# 7. MappingController

Lit reactive controllers are designed to encapsulate reusable feature state and lifecycle behavior, which is the intended role of this controller in the coordinate-system host. ([lit.dev][1])

## GWT — MappingController exists on the coordinate-system host

**Scenario CS-030 — CoordinateSystem owns a MappingController**

```gherkin
Given a CoordinateSystem is initialized
When initialization completes
Then it shall create and register a MappingController
And the MappingController shall participate through the Lit reactive controller mechanism
```

---

## GWT — Cartesian to SVG mapping

**Scenario CS-031 — MappingController maps Cartesian coordinates to SVG coordinates**

```gherkin
Given a Cartesian point within the current axis ranges
When MappingController maps the point to view coordinates
Then it shall return a deterministic SVG coordinate
And that coordinate shall be consistent with the current axis ranges and viewport bounds
```

---

## GWT — SVG to Cartesian mapping

**Scenario CS-032 — MappingController maps SVG coordinates back to Cartesian coordinates**

```gherkin
Given an SVG coordinate inside the CoordinateSystem viewport
When MappingController maps the coordinate to Cartesian space
Then it shall return the corresponding Cartesian coordinate
And the result shall be consistent with the current axis ranges
```

---

## GWT — Round-trip mapping consistency

**Scenario CS-033 — MappingController preserves round-trip consistency within numeric tolerance**

```gherkin
Given a Cartesian point in the coordinate system
When it is mapped to SVG coordinates
And then mapped back to Cartesian coordinates
Then the resulting Cartesian point shall equal the original point within the system's numeric tolerance
```

---

## GWT — Mapping updates when ranges change

**Scenario CS-034 — MappingController reacts to axis range changes**

```gherkin
Given MappingController is active
When the horizontal or vertical axis range changes
Then MappingController shall use the updated ranges for all future coordinate transformations
```

---

# 8. Coordinate-System Points Collection

## GWT — CoordinateSystem holds multiple points

**Scenario CS-040 — CoordinateSystem manages a collection of points**

```gherkin
Given multiple Point CanvasObjects are registered in the CoordinateSystem
When rendering or interpolation is requested
Then the CoordinateSystem shall evaluate the registered points in deterministic order
```

---

## GWT — Points are domain inputs for interpolation

**Scenario CS-041 — CoordinateSystem points feed interpolation**

```gherkin
Given a series of CoordinateSystem points exists
When interpolation is requested
Then those points shall be used as the input series for the interpolation operation
```

---

# 9. Curve Interpolation

The interpolation operation shall use the existing `core-math` library functions and its existing point or vector2 abstractions as the mathematical source for interpolation inputs and outputs.

## GWT — Interpolation uses core-math

**Scenario CS-050 — CoordinateSystem delegates interpolation to core-math**

```gherkin
Given a series of CoordinateSystem points exists
When the CoordinateSystem interpolates a curve
Then it shall use the existing core-math interpolation functions
And it shall use the existing core-math point or vector2 types as the mathematical input model
```

---

## GWT — Interpolated curve is derived from Cartesian points

**Scenario CS-051 — Interpolation occurs in Cartesian space**

```gherkin
Given a series of CoordinateSystem points exists
When curve interpolation is performed
Then interpolation shall be calculated in Cartesian coordinates
And the resulting curve geometry shall then be mapped to SVG coordinates for rendering
```

---

## GWT — Interpolated curve renders deterministically

**Scenario CS-052 — Same interpolation input yields same output**

```gherkin
Given the same ordered series of CoordinateSystem points
When interpolation is performed multiple times with unchanged inputs
Then the resulting interpolated curve geometry shall be identical
```

---

## GWT — Insufficient interpolation input is handled safely

**Scenario CS-053 — CoordinateSystem handles insufficient points safely**

```gherkin
Given fewer than the minimum required points for the chosen interpolation algorithm
When interpolation is requested
Then the system shall remain stable
And it shall not publish invalid curve geometry
```

---

## GWT — Interpolated curve updates when a point changes

**Scenario CS-054 — Curve reacts to point updates**

```gherkin
Given an interpolated curve has been created from a point series
When one of the source points changes its Cartesian position
Then the CoordinateSystem shall recompute the interpolation result
And the rendered curve shall update accordingly
```

---

## GWT — Interpolated curve updates when range changes

**Scenario CS-055 — Curve remaps on axis-range change**

```gherkin
Given an interpolated curve exists in Cartesian space
When one or both axis ranges change
Then the interpolation result in Cartesian space shall remain logically unchanged
And its rendered SVG geometry shall be recomputed through MappingController
```

---

# 10. Rectangle Drawing

The CoordinateSystem shall be able to draw rectangles using coordinate-system coordinates and mapped SVG geometry.

## GWT — Rectangle is defined in Cartesian space

**Scenario CS-060 — Rectangle uses Cartesian coordinates as source of truth**

```gherkin
Given a rectangle is defined in the CoordinateSystem
When the rectangle is stored by the system
Then its geometric definition shall be stored in Cartesian coordinates
And SVG coordinates shall be derived through MappingController
```

---

## GWT — Rectangle renders through mapping

**Scenario CS-061 — Rectangle geometry is mapped to SVG**

```gherkin
Given a rectangle exists in Cartesian space
When the CoordinateSystem renders the rectangle
Then each rectangle boundary coordinate shall be transformed through MappingController
And the resulting SVG rectangle geometry shall be rendered deterministically
```

---

## GWT — Rectangle responds to axis-range changes

**Scenario CS-062 — Rectangle remaps when the visible range changes**

```gherkin
Given a rectangle exists in Cartesian space
When one or both axis ranges change
Then the rectangle's Cartesian geometry shall remain unchanged
And its rendered SVG geometry shall be recalculated from the new mapping
```

---

## GWT — Rectangle may be represented by interpolated geometry

**Scenario CS-063 — Rectangle drawing may reuse interpolation output where required by the geometry pipeline**

```gherkin
Given the CoordinateSystem supports an interpolation-based drawing pipeline
When rectangle rendering requires sampled geometric output
Then the CoordinateSystem may derive the rendered boundary points through the interpolation function
And the resulting shape shall preserve the rectangle's Cartesian bounds
```

---

# 11. Combined Behavior

## GWT — Points, curves, and rectangles share the same mapping policy

**Scenario CS-070 — All coordinate primitives use one mapping source**

```gherkin
Given the CoordinateSystem contains points, curves, and rectangles
When those primitives are rendered
Then all of them shall use MappingController as the single mapping policy
```

---

## GWT — Axis range changes propagate to all mapped primitives

**Scenario CS-071 — Range change triggers full remap**

```gherkin
Given the CoordinateSystem contains one or more mapped primitives
When an axis range changes
Then all visible primitives that depend on coordinate mapping shall be recalculated against the new mapping
```

---

## GWT — CoordinateSystem remains deterministic

**Scenario CS-072 — Same domain state yields same visual state**

```gherkin
Given identical axis ranges
And identical point, curve, and rectangle definitions
When the CoordinateSystem renders multiple times
Then the resulting SVG output shall be identical
```

---

# 12. SVG Rendering Constraints

Lit renders templates through `html`, and the outer `<svg>` element should be part of that HTML template; SVG fragments can then be composed within it. That matches the rendering model specified here for the coordinate system and its child canvas objects. ([lit.dev][2])

## GWT — CoordinateSystem renders as SVG container content

**Scenario CS-080 — CoordinateSystem is rendered inside SVG**

```gherkin
Given the CoordinateSystem is hosted by the canvas
When the component renders
Then the coordinate system visual output shall be rendered as SVG content
And its child geometry shall be composed within that SVG rendering structure
```

---

## GWT — Mapped geometry is view-space only at render time

**Scenario CS-081 — SVG coordinates are derived, not primary**

```gherkin
Given a Point, Curve, or Rectangle exists
When the system renders the primitive
Then SVG coordinates shall be treated as derived view-state
And Cartesian coordinates shall remain the primary domain state
```

---

# 13. Controller Cooperation

## GWT — MappingController cooperates with MouseController

**Scenario CS-090 — Mouse interaction can be converted to Cartesian space**

```gherkin
Given MouseController provides normalized view-space pointer coordinates
When a coordinate-system interaction requires domain coordinates
Then MappingController shall convert those view coordinates into Cartesian coordinates
```

---

## GWT — MappingController cooperates with DragController

**Scenario CS-091 — Drag interactions can update Cartesian objects**

```gherkin
Given DragController provides drag movement in view-space
When a Point or other coordinate primitive is being manipulated
Then MappingController shall convert the drag position into Cartesian coordinates
Before the domain object is updated
```

---

## GWT — Axis range changes affect mapping before render

**Scenario CS-092 — Range changes and mapping are ordered correctly**

```gherkin
Given an Axis range has changed
When the next render cycle occurs
Then MappingController shall use the updated axis ranges
Before points, curves, or rectangles are rendered
```

---

# 14. Non-Functional Constraints

## GWT — Single mapping policy owner

**Scenario CS-100 — Mapping logic is centralized**

```gherkin
Given the CoordinateSystem architecture
When coordinate conversion is required
Then MappingController shall be the only component responsible for coordinate-space conversion
And other objects shall not duplicate mapping rules
```

---

## GWT — Core-math remains the math authority

**Scenario CS-101 — Interpolation math is not reimplemented in UI code**

```gherkin
Given interpolation is required in the CoordinateSystem
When the interpolation behavior is executed
Then the mathematical interpolation logic shall come from the existing core-math library
And UI components shall not introduce a second interpolation algorithm for the same purpose
```

---

## GWT — Domain state stays Cartesian

**Scenario CS-102 — Cartesian model is the source of truth**

```gherkin
Given the CoordinateSystem manages plotted primitives
When the system stores or mutates geometric data
Then the primary stored representation shall remain Cartesian
And SVG coordinates shall remain derived render data
```

---

# 15. Summary of New Types

## Canvas Objects

* `CoordinateSystem`
* `Axis`
* `Point`

## Reactive Controllers

* `MappingController`

## Supporting Dependencies

* existing `core-math` interpolation functions
* existing `core-math` point or vector2 abstractions

If you want the next step, I can turn this into a **strict TypeScript contract document** with:

* interfaces
* DTOs
* controller contracts
* event contracts
* namespace/module layout

[1]: https://lit.dev/docs/composition/controllers/?utm_source=chatgpt.com "Reactive Controllers"
[2]: https://lit.dev/docs/api/templates/?utm_source=chatgpt.com "Templates"
