# `@monorepo/core-plot`

## Given–When–Then Specification

### Scope

This document defines the behavioral specification for a TypeScript `core-plot` module using:

* **Lit 3**
* **SVG**
* **Cartesian coordinate system**
* **OOP design**
* **Canvas as composition root**
* **Reactive Controllers for interaction behavior**

This is a **behavior specification**, not an implementation.

---

# 1. Module Intent

The module shall provide a plotting canvas capable of:

* hosting and rendering `CanvasObject` instances
* rendering grid and axis primitives
* supporting mouse-driven interaction
* supporting drag operations
* supporting snapping
* supporting scale/range interaction on axis objects
* supporting standard interaction primitives:

  * `OnClick`
  * `OnDoubleClick`
  * `OnScale`

---

# 2. Architectural Overview

## 2.1 Composition Root

The system composition root is:

* `PlotCanvasElement`

It owns:

* canvas state
* object registry
* render orchestration
* reactive controllers

---

## 2.2 Primary Concepts

### Web Component

* `PlotCanvasElement`

### Domain Object Contracts

* `ICanvasObject`
* `IAxisObject`

### Reactive Controllers

* `MouseController`
* `DragController`
* `GridController`
* `SnapController`
* `OnClickController`
* `OnDoubleClickController`
* `OnScaleController`
* `OnRangeChangeController`

---

# 3. Core Domain Contracts

---

## 3.1 `ICanvasObject`

A `CanvasObject` is a renderable and interactive object hosted by `PlotCanvasElement`.

### Required behavioral responsibilities

* stable identity
* deterministic bounds
* deterministic rendering
* hit testing
* optional participation in interactions

---

### GWT — Stable identity

**Scenario S-001 — CanvasObject identity is stable**

```gherkin
Given a CanvasObject has been created
When the system reads the object's id multiple times
Then the id shall remain unchanged
And the id shall uniquely identify that object within the canvas
```

---

### GWT — Render participation

**Scenario S-002 — CanvasObject participates in render cycle**

```gherkin
Given a CanvasObject is registered in the canvas
When the render cycle executes
Then the object shall be rendered
And it shall receive the render context supplied by the canvas
```

---

### GWT — Hit testing

**Scenario S-003 — CanvasObject supports hit testing**

```gherkin
Given a pointer position in canvas coordinates
When hit testing is performed against a CanvasObject
Then the object shall return true only if the point intersects the object's interactive geometry
And false otherwise
```

---

### GWT — Interaction opt-in

**Scenario S-004 — CanvasObject may opt into interaction behavior**

```gherkin
Given a CanvasObject is registered in the canvas
When the object does not support a specific interaction
Then the system shall not invoke that interaction contract on the object
And the canvas shall remain stable
```

---

# 4. PlotCanvasElement

`PlotCanvasElement` is the composition root and host web component.

Its responsibilities are orchestration only.

It shall not embed object-specific interaction logic.

---

## GWT — Initialization

**Scenario S-010 — Canvas initializes required controllers**

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

---

## GWT — Object registry

**Scenario S-011 — Canvas maintains registered objects**

```gherkin
Given one or more CanvasObjects are added to the canvas
When registration completes
Then the objects shall participate in rendering
And the objects shall participate in hit testing according to their capabilities
```

---

## GWT — Deterministic rendering

**Scenario S-012 — Canvas renders deterministically**

```gherkin
Given the canvas contains multiple registered objects
When a render cycle executes
Then the objects shall be rendered in deterministic order
And repeated renders with unchanged state shall produce the same visual result
```

---

## GWT — Controller orchestration only

**Scenario S-013 — Canvas delegates behavior to controllers**

```gherkin
Given a user interaction occurs on the canvas
When the event is processed
Then PlotCanvasElement shall delegate the behavior to the appropriate controller
And shall not directly implement interaction-specific policy
```

---

# 5. MouseController

`MouseController` is responsible for listening to pointer or mouse-related DOM events and exposing normalized interaction state to the system.

Its concern is **event collection and normalization**, not object mutation.

---

## GWT — Pointer tracking

**Scenario S-020 — MouseController tracks pointer position**

```gherkin
Given the pointer moves within the canvas area
When a pointer move event occurs
Then MouseController shall update the current pointer position
And the position shall be represented in canvas coordinates
```

---

## GWT — Button state

**Scenario S-021 — MouseController tracks button state**

```gherkin
Given a pointer button is pressed or released
When the event occurs
Then MouseController shall update button state
And that state shall be available to other controllers
```

---

## GWT — Event normalization

**Scenario S-022 — MouseController normalizes native DOM events**

```gherkin
Given the browser raises native pointer or mouse events
When MouseController processes those events
Then it shall normalize them into a consistent internal event model
And downstream controllers shall not depend directly on raw DOM event shape
```

---

# 6. DragController

`DragController` is responsible for drag lifecycle management and drag-target coordination.

Its concern is **drag operations**, not event listening.

It depends on `MouseController` for input state.

---

## 6.1 Standard Drag Participation

Drag participation shall include the standard drag lifecycle concepts aligned with HTML drag semantics where applicable to the canvas interaction model:

* drag start
* drag move
* drag enter
* drag over
* drag leave
* drop
* drag end

These are modeled as behavioral phases in the canvas system.

---

## GWT — Drag start

**Scenario S-030 — Drag starts on draggable object**

```gherkin
Given a draggable CanvasObject is under the pointer
And the primary pointer button is pressed
When movement exceeds the drag threshold
Then DragController shall start a drag operation
And the object shall become the active drag target
And drag start shall be raised exactly once
```

---

## GWT — Single active drag

**Scenario S-031 — Only one drag operation may be active**

```gherkin
Given a drag operation is already active
When another drag attempt occurs
Then the system shall reject the second drag start
And the original drag operation shall remain active
```

---

## GWT — Drag move

**Scenario S-032 — Active drag produces movement updates**

```gherkin
Given a drag operation is active
When the pointer moves
Then DragController shall compute drag delta
And it shall publish drag move updates to the active target
```

---

## GWT — Drag enter

**Scenario S-033 — Drag enters a drop-capable target**

```gherkin
Given a drag operation is active
And the pointer crosses into another drop-capable CanvasObject
When the pointer first intersects that object
Then DragController shall raise drag enter for that object exactly once
```

---

## GWT — Drag over

**Scenario S-034 — Drag over continues while hovering a target**

```gherkin
Given a drag operation is active
And the pointer remains over a drop-capable CanvasObject
When drag movement continues
Then DragController shall raise drag over updates for that target
```

---

## GWT — Drag leave

**Scenario S-035 — Drag leaves a drop-capable target**

```gherkin
Given a drag operation is active
And the pointer was over a drop-capable CanvasObject
When the pointer exits the target area
Then DragController shall raise drag leave for that target exactly once
```

---

## GWT — Drop

**Scenario S-036 — Drop is raised on release over valid target**

```gherkin
Given a drag operation is active
And the pointer is currently over a valid drop target
When the pointer button is released
Then DragController shall raise drop on that target
And the drag operation shall transition to completion
```

---

## GWT — Drag end

**Scenario S-037 — Drag end always terminates the operation**

```gherkin
Given a drag operation is active
When the drag operation completes or is cancelled
Then DragController shall raise drag end exactly once
And it shall clear internal drag state
```

---

# 7. GridController

`GridController` provides the background grid behavior and grid configuration.

---

## GWT — Grid rendering

**Scenario S-040 — Grid is rendered**

```gherkin
Given grid rendering is enabled
When the canvas render cycle executes
Then GridController shall render grid lines in the background
And the lines shall align with the current coordinate system
```

---

## GWT — Grid spacing

**Scenario S-041 — Grid uses configured spacing**

```gherkin
Given a grid spacing value is configured
When the grid is rendered
Then the spacing between rendered grid lines shall match the configured spacing
```

---

## GWT — Grid update

**Scenario S-042 — Grid responds to spacing changes**

```gherkin
Given the grid spacing changes
When the next render cycle occurs
Then the grid rendering shall reflect the new spacing
```

---

# 8. SnapController

`SnapController` maps free interaction coordinates to snapped coordinates.

---

## GWT — Snap to grid

**Scenario S-050 — Coordinates snap to nearest grid point**

```gherkin
Given snapping is enabled
And a pointer position is evaluated
When SnapController processes the position
Then it shall return the nearest valid snap position on the grid
```

---

## GWT — Snap disabled

**Scenario S-051 — No snapping when disabled**

```gherkin
Given snapping is disabled
When a pointer position is evaluated
Then SnapController shall return the original position unchanged
```

---

## GWT — Snap used during drag

**Scenario S-052 — Drag movement is snap-aware**

```gherkin
Given a drag operation is active
And snapping is enabled
When DragController computes the next interaction position
Then it shall pass the position through SnapController before applying it
```

---

# 9. OnClickController

`OnClickController` handles click recognition.

---

## GWT — Single click

**Scenario S-060 — Click selects the top-most eligible object**

```gherkin
Given one or more clickable CanvasObjects exist under the pointer
When the user performs a single click
Then OnClickController shall resolve the top-most eligible object
And it shall raise click behavior for that object
```

---

## GWT — Click without target

**Scenario S-061 — Click on empty area does not fail**

```gherkin
Given no clickable CanvasObject exists under the pointer
When the user performs a click
Then the system shall remain stable
And no object click behavior shall be invoked
```

---

# 10. OnDoubleClickController

`OnDoubleClickController` handles double-click recognition independently from raw mouse event capture.

---

## GWT — Double click

**Scenario S-070 — Double click invokes double-click interaction**

```gherkin
Given a double-clickable CanvasObject exists under the pointer
When the user performs a valid double-click gesture
Then OnDoubleClickController shall invoke double-click behavior for that object
```

---

## GWT — Single click is not double click

**Scenario S-071 — Single click does not trigger double-click behavior**

```gherkin
Given a user performs only a single click
When OnDoubleClickController evaluates the interaction
Then it shall not raise a double-click interaction
```

---

# 11. OnScaleController

`OnScaleController` handles scaling gestures and scale interaction semantics.

It is an interaction controller, not an axis-specific policy controller.

Scale can later be connected to zoom or range transformation.

---

## GWT — Scale interaction start

**Scenario S-080 — Scale interaction may begin on scalable target**

```gherkin
Given a scalable CanvasObject exists
When a valid scale gesture begins on that object
Then OnScaleController shall start a scale interaction
```

---

## GWT — Scale factor production

**Scenario S-081 — Scale interaction produces a deterministic factor**

```gherkin
Given a scale interaction is active
When the user changes the scale gesture input
Then OnScaleController shall compute a deterministic scale factor
And it shall publish that factor to the participating target
```

---

## GWT — No scale on non-scalable object

**Scenario S-082 — Non-scalable targets ignore scale interaction**

```gherkin
Given a CanvasObject does not support scale interaction
When a scale gesture is attempted on that object
Then the system shall not apply scaling behavior to that object
```

---

# 12. Axis Object

An `Axis` is a `CanvasObject`.

It is an SVG object that represents a one-dimensional measurable domain.

It shall later participate in a larger coordinate system, but in this scope it is specified independently.

---

## 12.1 Axis Requirements

An axis shall have:

* stable identity
* orientation
* rendered line geometry
* rendered endpoints
* current numeric range
* default range `[-10, 10]`

---

## GWT — Axis default range

**Scenario S-090 — Axis initializes with default range**

```gherkin
Given an Axis object is created without an explicit range
When initialization completes
Then the Axis range shall be [-10, 10]
```

---

## GWT — Axis renders as SVG object

**Scenario S-091 — Axis is rendered using SVG**

```gherkin
Given an Axis object is registered in the canvas
When the canvas render cycle executes
Then the Axis shall render as SVG geometry
And the rendered geometry shall represent the current axis range
```

---

## GWT — Axis endpoints are interactive

**Scenario S-092 — Axis endpoints may participate in range interaction**

```gherkin
Given an Axis object is rendered
When the end-user interacts with an endpoint handle
Then the endpoint shall participate in axis range change behavior
```

---

# 13. OnRangeChangeController

`OnRangeChangeController` is responsible for modifying the range of an `Axis` object.

It shall use:

* `MouseController`
* `DragController`

It is axis-specific interaction policy.

---

## GWT — Range change begins from axis endpoint

**Scenario S-100 — Dragging an axis endpoint starts range change**

```gherkin
Given an Axis object is rendered with interactive endpoint handles
And the user presses on one endpoint handle
When DragController starts a drag operation for that handle
Then OnRangeChangeController shall start an axis range change operation
```

---

## GWT — Range change uses drag movement

**Scenario S-101 — Axis range changes during drag**

```gherkin
Given an axis range change operation is active
When the pointer moves through DragController
Then OnRangeChangeController shall compute a new axis range
And the axis shall update to that new range
```

---

## GWT — Range change uses mouse coordinates

**Scenario S-102 — Axis range calculations use normalized pointer coordinates**

```gherkin
Given MouseController is tracking pointer position
And an axis range change is active
When OnRangeChangeController evaluates the interaction
Then it shall use normalized canvas coordinates from MouseController
And shall not depend on raw DOM coordinates directly
```

---

## GWT — Axis keeps valid ordering

**Scenario S-103 — Axis range remains valid after change**

```gherkin
Given an axis range change operation is active
When the user drags an endpoint across the current range
Then the resulting axis range shall remain valid according to the axis invariant
And invalid range state shall not be published
```

---

## GWT — Default axis changes from [-10,10]

**Scenario S-104 — End-user can modify default axis range**

```gherkin
Given an Axis starts with range [-10, 10]
When the user drags an endpoint handle
Then the axis range shall change according to the drag input
And the updated range shall replace the previous range
```

---

## GWT — Range change completes on release

**Scenario S-105 — Axis range change ends with drag completion**

```gherkin
Given an axis range change operation is active
When the pointer button is released
Then OnRangeChangeController shall finalize the current range
And the operation shall end cleanly
```

---

# 14. Controller Cooperation

---

## GWT — Mouse feeds drag

**Scenario S-110 — DragController consumes mouse state**

```gherkin
Given MouseController tracks pointer and button state
When a drag-capable interaction is evaluated
Then DragController shall use MouseController as its event state source
```

---

## GWT — Drag feeds range change

**Scenario S-111 — OnRangeChangeController consumes drag lifecycle**

```gherkin
Given DragController manages the drag lifecycle
When an active drag target is an axis endpoint
Then OnRangeChangeController shall consume drag state transitions to modify axis range
```

---

## GWT — Snap may constrain axis changes

**Scenario S-112 — Axis range changes may be snap-aware**

```gherkin
Given snapping is enabled
And an axis endpoint is being dragged
When the new interaction position is evaluated
Then the position may be transformed by SnapController before the range is updated
```

---

# 15. Layered Interaction Breakdown

The interaction system shall be decomposed into the following controllers:

* `OnClickController`
* `OnDoubleClickController`
* `OnScaleController`
* `OnRangeChangeController`

These shall consume lower-level infrastructure services from:

* `MouseController`
* `DragController`

This enforces separation between:

* event collection
* drag lifecycle
* semantic interaction behavior

---

## GWT — Interaction decomposition

**Scenario S-120 — Semantic interactions are separated from infrastructure controllers**

```gherkin
Given the interaction architecture of the canvas
When the system processes user input
Then MouseController shall be responsible for pointer event collection
And DragController shall be responsible for drag lifecycle management
And semantic controllers shall interpret those lower-level signals into domain interactions
```

---

# 16. Non-Functional Constraints

---

## GWT — Separation of concerns

**Scenario S-130 — Responsibilities remain separated**

```gherkin
Given the core-plot architecture
Then PlotCanvasElement shall own orchestration
And CanvasObjects shall own render and domain behavior
And reactive controllers shall own interaction behavior
```

---

## GWT — Determinism

**Scenario S-131 — Behavior is deterministic**

```gherkin
Given identical object state
And identical user input sequence
When the interaction is processed multiple times
Then the resulting object state and rendered output shall be identical
```

---

## GWT — No hidden coupling

**Scenario S-132 — Controllers do not mutate each other directly**

```gherkin
Given multiple reactive controllers exist in the same canvas
When one controller needs information from another
Then it shall do so through explicit contracts
And no controller shall mutate another controller’s private state directly
```

---

## GWT — Stable empty interaction behavior

**Scenario S-133 — Empty interactions are safe**

```gherkin
Given the user interacts with an empty region of the canvas
When no eligible object is present
Then the system shall remain stable
And no unexpected mutation shall occur
```

---

# 17. Summary of Specified Types

## Web Component

* `PlotCanvasElement`

## Canvas Objects

* `ICanvasObject`
* `IAxisObject`

## Infrastructure Controllers

* `MouseController`
* `DragController`
* `GridController`
* `SnapController`

## Semantic Interaction Controllers

* `OnClickController`
* `OnDoubleClickController`
* `OnScaleController`
* `OnRangeChangeController`

---

# 18. Recommended Next Artifact

The next correct step is:

1. **TypeScript contracts only**

   * interfaces
   * event types
   * controller contracts
   * no implementation

Then after that:

2. **GWT-aligned Vitest specifications**
3. **Lit3 + SVG implementation**

If you want, I can write the next document as a **pure TypeScript contract specification** for:

* `ICanvasObject`
* `IAxisObject`
* controller interfaces
* event DTOs
* composition root contracts
