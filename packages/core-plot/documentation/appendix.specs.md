# 📎 Appendix A — SVG Composition, Domain Corrections, and Styling Specification

This appendix amends and extends the `@monorepo/core-plot` specification with:

* corrected domain boundaries
* SVG composition model
* builder/factory contracts
* styling via `core-style-system`
* Lit3 usage constraints
* open–closed enforcement via reactive controllers

---

# A.1 Domain Corrections

## A.1.1 Point is NOT a CanvasObject

A `Point` is a **CoordinateSystem domain object**, not a `CanvasObject`.

### GWT — Point is a domain object

```gherkin
Given a Point exists in the CoordinateSystem
When the system evaluates its type
Then the Point shall be a domain object
And it shall not be a CanvasObject
And it shall not implement rendering behavior directly
```

---

## A.1.2 Coordinate container

The CoordinateSystem shall own a **coordinate container**.

### GWT — Coordinate container holds domain points

```gherkin
Given a CoordinateSystem is initialized
When points are added to the system
Then the CoordinateSystem shall store them in a coordinate container
And the container shall be the single source of truth for all points
```

---

## A.1.3 Axis contains TickSvg objects

Axis rendering must be composed.

### GWT — Axis contains ticks

```gherkin
Given an Axis is rendered
When the render cycle executes
Then the Axis shall render TickSvg objects
And each TickSvg shall represent a value in the axis domain
```

---

# A.2 SVG Object Model

## A.2.1 All visual elements are SVG-based

All rendering primitives must be SVG.

### GWT — All CanvasObjects are SVG-backed

```gherkin
Given a CanvasObject exists
When it renders
Then it shall render using SVG primitives
And it shall not use non-SVG rendering mechanisms
```

---

## A.2.2 Base SVG primitives

The system shall define the following base SVG primitives as Lit3 components:

* `SvgLineElement`
* `SvgCircleElement`
* `SvgRectangleElement`
* `SvgArrowElement`

---

### GWT — Primitive SVG objects exist

```gherkin
Given the SVG subsystem is initialized
When primitives are required
Then the system shall provide Line, Circle, Rectangle, and Arrow primitives
As Lit3 web components
```

---

## A.2.3 Composition over inheritance

All higher-level SVG objects must be composed from primitives.

### GWT — Composition rule

```gherkin
Given a complex SVG object is created
When its structure is evaluated
Then it shall be composed of primitive SVG elements
And it shall not reimplement primitive geometry logic
```

---

# A.3 Styling Specification (core-style-system)

## A.3.1 No CSS allowed

Strict constraint:

* ❌ No CSS files
* ❌ No inline styles
* ❌ No `<style>` blocks

---

### GWT — Styling constraint

```gherkin
Given any SVG or CanvasObject
When styling is applied
Then it shall use the core-style-system exclusively
And no CSS file or inline style shall be used
```

---

## A.3.2 Token-based styling

All styling must come from:

* `core-style-system`
* token-based APIs

---

### GWT — Token-based styling

```gherkin
Given an SVG object is rendered
When visual properties are applied
Then styling shall be resolved via token keys
And those tokens shall come from the core-style-system
```

---

## A.3.3 Style states

Every SVG object must support:

* `Normal`
* `Highlighted`

---

### GWT — Style states

```gherkin
Given an SVG object exists
When its visual state changes
Then it shall support:
  - Normal state
  - Highlighted state
And the style shall be resolved through tokens
```

---

# A.4 Builder Pattern for SVG

## A.4.1 Builder contract

All SVG primitives must be constructible using builders.

```ts
export interface Builder<T> {
  build(): T;
}
```

---

## A.4.2 Primitive builders

Each primitive shall have a builder:

* `LineBuilder`
* `CircleBuilder`
* `RectangleBuilder`
* `ArrowBuilder`

---

### GWT — Builders create primitives

```gherkin
Given a builder for an SVG primitive
When build() is invoked
Then it shall return a fully constructed SVG object
And the object shall be valid for rendering
```

---

## A.4.3 Immutable build output

### GWT — Builder output is immutable

```gherkin
Given a builder produces an SVG object
When the object is returned
Then its configuration shall be immutable
And mutation shall require a new builder instance
```

---

# A.5 Factory Pattern for Composition

Factories are responsible for composing primitives into higher-level objects.

---

## A.5.1 Factory responsibility

Factories assemble:

* Axis (line + ticks + arrow)
* Rectangle compositions
* Curve geometry
* Coordinate visuals

---

### GWT — Factory composition

```gherkin
Given a factory is used to create a complex SVG object
When the factory executes
Then it shall compose the object from primitive SVG elements
And it shall not embed rendering logic directly
```

---

## A.5.2 Open–Closed compliance

Factories must support extension without modification.

---

### GWT — Factory extensibility

```gherkin
Given a new SVG composition is required
When extending the system
Then a new factory shall be introduced
And existing factories shall not be modified
```

---

# A.6 Lit3 Usage Constraints

## A.6.1 Controlled number of LitElements

Avoid excessive component count.

---

### GWT — Controlled element count

```gherkin
Given the rendering system
When composing SVG structures
Then the number of LitElements shall be minimized
And templates shall be used for composition where possible
```

---

## A.6.2 Use templates for composition

---

### GWT — Template composition

```gherkin
Given a composite SVG object
When rendering occurs
Then it may be composed using Lit templates
And not require a dedicated LitElement per sub-element
```

---

## A.6.3 Reactive controllers for behavior

Reactive controllers must be used for:

* interaction behavior
* mapping
* drag
* scaling
* snapping

---

### GWT — Behavior isolation

```gherkin
Given an interaction or behavior concern
When it is implemented
Then it shall be encapsulated in a reactive controller
And not embedded directly in the LitElement
```

---

# A.7 Open–Closed Principle Enforcement

## A.7.1 Extension via controllers

---

### GWT — Controller extension

```gherkin
Given new interaction behavior is required
When the system is extended
Then a new reactive controller shall be introduced
And existing controllers shall not be modified
```

---

## A.7.2 Extension via composition

---

### GWT — Composition extension

```gherkin
Given new visual structures are required
When extending the system
Then new compositions shall be built from primitives
And existing primitives shall remain unchanged
```

---

## A.7.3 No behavior leakage

---

### GWT — Separation of concerns

```gherkin
Given the system architecture
When responsibilities are evaluated
Then:
  - Canvas orchestrates
  - Controllers handle behavior
  - Domain objects hold data
  - SVG components render
And no layer shall violate this separation
```

---

# A.8 Axis Rendering Composition (Detailed)

Axis must be composed of:

* Line (main axis)
* Arrow (direction)
* TickSvg (repeated composition)

---

### GWT — Axis composition

```gherkin
Given an Axis is rendered
When its structure is evaluated
Then it shall consist of:
  - one line primitive
  - one arrow primitive
  - multiple TickSvg primitives
```

---

### GWT — Tick generation

```gherkin
Given an Axis range
When ticks are generated
Then TickSvg objects shall be created at deterministic intervals
And each tick shall map to a value in the axis domain
```

---

# A.9 Coordinate System Rendering Composition

The CoordinateSystem must be composed of:

* Axis objects
* SVG primitives
* mapped domain data

---

### GWT — CoordinateSystem composition

```gherkin
Given a CoordinateSystem renders
When the render cycle executes
Then it shall compose:
  - horizontal axis
  - vertical axis
  - mapped point visuals
  - interpolated curves
  - rectangle geometries
Using SVG primitives and templates
```

---

# A.10 Summary of Additions

## Domain Changes

* Point → domain object (not CanvasObject)
* Coordinate container introduced

## SVG System

* All rendering via SVG
* Primitive-based composition

## Styling

* 100% token-based (`core-style-system`)
* No CSS allowed
* Normal + Highlight states required

## Construction

* `Builder<T>` for primitives
* Factories for composition

## Lit3 Usage

* Minimize components
* Prefer templates
* Use reactive controllers for behavior

## Architecture

* Strict separation
* Open–Closed enforced via:

  * controllers
  * factories
  * composition

---

# Next Step (Recommended)

Next logical artifact:

👉 **TypeScript contracts (strict, production-grade)**

Including:

* `IMappingController`
* `ICoordinateSystem`
* `IAxisObject`
* `ITickSvg`
* `ISvgPrimitive`
* Builders + factories
* Event DTOs

Confirm before I generate.
