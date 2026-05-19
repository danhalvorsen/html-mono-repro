 
# As-is 

l-system
├── game-coordinate-system-and-mappers
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── Axis.ts
│   │   ├── IInterval.ts
│   │   ├── Interval.ts
│   │   └── Mapper.ts
│   ├── tests
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── game-l-system-abstract
│   ├── package.json
│   ├── README.md
│   ├── src
│   ├── tests
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── game-l-system-svg
│   ├── package.json
│   ├── README.md
│   ├── src
│   ├── tests
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── game-turtle-abstract
│   ├── code.ps1
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── errors
│   │   │   ├── InvalidPrimitiveParameterError.ts
│   │   │   ├── InvalidRotationError.ts
│   │   │   ├── PopEmptyStackError.ts
│   │   │   └── TurtleDomainError.ts
│   │   ├── index.ts
│   │   ├── math
│   │   │   ├── DefaultTurtleVectorMath.ts
│   │   │   └── ITurtleVectorMath.ts
│   │   ├── primitives
│   │   │   ├── CreatePrimitiveOptions.ts
│   │   │   ├── DefaultPrimitiveFactory.ts
│   │   │   ├── IPrimitiveFactory.ts
│   │   │   ├── PrimitiveKind.ts
│   │   │   ├── PrimitiveMetadata.ts
│   │   │   ├── PrimitiveValueCopier.ts
│   │   │   └── TurtlePrimitive.ts
│   │   ├── styles
│   │   │   ├── FillStyle.ts
│   │   │   └── StrokeStyle.ts
│   │   ├── turtle
│   │   │   ├── DefaultTurtle2D.ts
│   │   │   ├── DefaultTurtle3D.ts
│   │   │   ├── DefaultTurtleFactory.ts
│   │   │   ├── ITurtle2D.ts
│   │   │   ├── ITurtle3D.ts
│   │   │   ├── TurtleMode.ts
│   │   │   ├── TurtleSnapshot.ts
│   │   │   └── TurtleStateFactory.ts
│   │   └── vectors
│   │       └── Vector3.ts
│   ├── tests
│   │   ├── fixtures
│   │   │   └── TurtleContractTestFixture.ts
│   │   ├── PrimitiveFactory.contract.test.ts
│   │   ├── Turtle.commands.test.ts
│   │   ├── Turtle.default-state.test.ts
│   │   ├── Turtle.stack.test.ts
│   │   └── Turtle.todo.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── game-turtle-svg
│   ├── code.ps1
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── index.ts
│   ├── tests
│   │   ├── DefaultSvgTurtleRenderer.test.ts
│   │   ├── fixtures
│   │   │   └── SvgTurtleRendererTestFixture.ts
│   │   ├── SvgCirclePrimitiveAdapter.test.ts
│   │   ├── SvgEscaping.test.ts
│   │   ├── SvgLinePrimitiveAdapter.test.ts
│   │   ├── SvgPolygonPrimitiveAdapter.test.ts
│   │   ├── SvgPolylinePrimitiveAdapter.test.ts
│   │   ├── SvgPrimitiveAdapterRegistry.test.ts
│   │   └── SvgTurtle.todo.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── spesification-l-system.md
├── spesification.md
└── turtle.app
    └── my-lit-app
        ├── backlog.md
        ├── code.ps1
        ├── index.html
        ├── package.json
        ├── public
        ├── src
        │   ├── assets
        │   ├── components
        │   │   ├── svg-shape-list.ts
        │   │   ├── turtle-command-editor.ts
        │   │   ├── turtle-command-list.ts
        │   │   ├── turtle-svg-viewer.ts
        │   │   └── turtle-workbench.ts
        │   ├── index.css
        │   └── turtle-command
        │       ├── CenteredSvgMapperPipeline.ts
        │       ├── TurtleCommandContracts.ts
        │       ├── TurtleCommandParser.ts
        │       ├── TurtleCommandVocabulary.ts
        │       ├── TurtleMarkerFactory.ts
        │       └── TurtleSvgSceneRenderer.ts
        └── tsconfig.json

````md
# L-System Turtle Graphics Specification

## Purpose

This module group provides a reusable turtle graphics subsystem for game and graphics applications.

The design separates:

1. Coordinate systems and coordinate mapping
2. Reusable design pattern infrastructure
3. Abstract turtle movement and drawing intent
4. Renderer-neutral primitive creation
5. Renderer-specific primitive adaptation
6. L-system generation and command interpretation

The turtle must not be coupled directly to SVG, Canvas, WebGL, Lit, DOM APIs, or any concrete rendering technology.

---

# Module Overview

```text
l-system
├── game-coordinate-system-and-mappers
├── game-turtle-abstract
├── game-turtle-svg
└── game-turtle-svg-l-system
````

Shared infrastructure packages:

```text
@monorepo/core-math
@monorepo/core-design-patterns
@monorepo/game-design-svg
```

---

# Architectural Boundary

The intended dependency direction is:

```text
@monorepo/core-design-patterns
@monorepo/core-math
        ↑
        |
game-coordinate-system-and-mappers
        ↑
        |
game-turtle-abstract
        ↑
        |
game-turtle-svg
        ↑
        |
game-turtle-svg-l-system
```

## Dependency Rules

`game-turtle-abstract` may depend on:

```text
@monorepo/core-math
@monorepo/core-design-patterns
@monorepo/game-coordinate-system-and-mappers
```

`game-turtle-svg` may depend on:

```text
game-turtle-abstract
@monorepo/core-design-patterns
@monorepo/game-coordinate-system-and-mappers
@monorepo/game-design-svg
lit
```

`game-turtle-svg-l-system` may depend on:

```text
game-turtle-abstract
game-turtle-svg
@monorepo/core-design-patterns
```

`game-turtle-abstract` must not depend on:

```text
lit
SVG
Canvas
WebGL
DOM
game-turtle-svg
game-turtle-svg-l-system
```

---

# Core Rule

The turtle owns movement and abstract drawing intent.

The primitive factory owns immutable primitive creation.

The coordinate mapper owns coordinate conversion.

The renderer owns primitive adaptation and output generation.

The L-system owns symbolic generation and command interpretation.

Reusable design patterns belong in `@monorepo/core-design-patterns`.

No module may take responsibility for another module's concern.

---

# game-coordinate-system-and-mappers

## Responsibility

`game-coordinate-system-and-mappers` owns coordinate-system abstractions and mapping logic.

It provides reusable types and mappers for converting positions between different coordinate systems, such as:

* Turtle coordinate system
* Game/world coordinate system
* Screen coordinate system
* SVG coordinate system

This module is required because different renderers use different coordinate conventions.

Example:

* A game/world coordinate system may use positive Y upward.
* SVG uses positive Y downward.

The turtle and L-system modules must use this package for coordinate conversion instead of implementing their own coordinate mapping logic.

## Required Capabilities

The module must provide:

* Axis abstractions
* Interval abstractions
* Coordinate system abstractions
* Mapper abstractions
* Concrete mappers for known coordinate-system conversions

## Design Rules

* Coordinate conversion must be explicit.
* No renderer-specific coordinate assumptions may be hidden inside turtle logic.
* SVG Y-axis inversion must be handled by a mapper, not by turtle movement code.
* Mapping logic must be reusable by SVG, Canvas, WebGL, and future renderers.
* No turtle or renderer module may define competing coordinate-system, axis, interval, or mapper abstractions when the required abstraction already exists in `@monorepo/game-coordinate-system-and-mappers`.

## Non-Goals

This module must not:

* Render graphics
* Know about turtle commands
* Know about L-system rules
* Own SVG, Canvas, WebGL, or Lit rendering behavior
* Own renderer-specific primitive adapters

---

# @monorepo/core-design-patterns

## Responsibility

`@monorepo/core-design-patterns` owns reusable, domain-neutral design pattern infrastructure.

Feature modules must not create local duplicated implementations of reusable design patterns when the pattern is generally applicable outside the module.

This applies to patterns such as:

* FSM / State Machine
* Strategy
* Adapter
* Factory
* Registry
* Composite
* Command
* Interpreter

Module-specific usage may compose these abstractions, but reusable pattern infrastructure belongs in `@monorepo/core-design-patterns`.

## Adding New Design Patterns

When a new reusable design pattern is needed, it must first be added to:

```text
@monorepo/core-design-patterns
```

The implementation must include unit tests before it is consumed by turtle, SVG, or L-system modules.

Required deliverables for a new reusable pattern:

* Interface-first abstraction
* Minimal public API
* Deterministic implementation
* Unit tests
* Export from package entry point
* No dependency on turtle, SVG, L-system, game modules, DOM, Lit, Canvas, or WebGL

## Unit Test Requirement

Every new reusable design pattern added to `@monorepo/core-design-patterns` must include tests covering:

* Valid usage
* Invalid usage
* Edge cases
* Deterministic behavior
* Extension through new types
* Failure modes and domain errors where relevant

Pattern tests must verify the reusable pattern itself, not turtle-specific behavior.

Turtle-specific behavior must be tested in `game-turtle-abstract`.

SVG-specific behavior must be tested in `game-turtle-svg`.

L-system-specific behavior must be tested in `game-turtle-svg-l-system`.

## Design Pattern Rule

Reusable patterns belong in `@monorepo/core-design-patterns`.

Domain behavior belongs in the domain module.

The turtle module may use patterns, but must not become a pattern library.

---

# game-turtle-abstract

## Responsibility

`game-turtle-abstract` defines the rendering-independent turtle graphics engine.

It owns:

* Turtle state
* Turtle commands
* Turtle state stack
* Renderer-neutral primitives
* Primitive factory
* Primitive metadata contracts
* Turtle-specific domain errors

It must not contain concrete rendering logic.

---

# Turtle Core Requirements

## 1. Canonical Turtle Command Set

The turtle core must expose a fixed, authoritative command vocabulary.

All commands operate on the 3D turtle state model:

* Position
* Forward vector
* Left vector
* Up vector
* Pen state
* Stroke style
* Fill style
* Metadata context
* State stack

## Default Coordinate System

The default turtle coordinate system is a right-handed Cartesian coordinate system.

* Positive X points right.
* Positive Y points upward.
* Positive Z points out of the XY plane.
* 2D mode is the XY plane with `z = 0`.

Default orientation:

```text
position = (0, 0, 0)
forward  = (1, 0, 0)
left     = (0, 1, 0)
up       = (0, 0, 1)
```

## Required Commands

* `forward(distance)`
* `move(distance)` — alias of `forward`
* `turnLeft(degrees)`
* `turnRight(degrees)`
* `pitchUp(degrees)`
* `pitchDown(degrees)`
* `rollLeft(degrees)`
* `rollRight(degrees)`
* `penUp()`
* `penDown()`
* `setStroke(style)`
* `setFill(style)`
* `pushState()`
* `popState()`
* `reset()`
* `clear()`

## Command Rules

Commands are deterministic turtle operations.

A command may:

* Update turtle state
* Append renderer-neutral primitives

A command must not:

* Perform coordinate mapping
* Call renderer logic
* Depend on SVG, Canvas, WebGL, Lit, or DOM APIs
* Introduce randomness
* Mutate previously emitted primitives
* Perform I/O

All vector, matrix, rotation, projection, normalization, distance, and geometry calculations must use `@monorepo/core-math`.

All coordinate mapping must use `@monorepo/game-coordinate-system-and-mappers`.

---

## 2. Turtle State Management

The turtle core may use the FSM design pattern for state management if it improves correctness, testability, or extensibility.

FSM usage is optional, not mandatory.

Use FSM when turtle behavior requires explicit state transitions, such as:

* Pen up / pen down
* 2D mode / 3D mode
* Active drawing / cleared drawing
* Stack push/pop validation
* Future constrained drawing modes

Do not introduce FSM complexity for simple immutable state updates unless it provides clear value.

## FSM Dependency Rule

If FSM is used, the turtle module must consume FSM abstractions from:

```text
@monorepo/core-design-patterns
```

The turtle module must not implement its own reusable FSM framework.

Allowed turtle-specific code:

* Turtle state definitions
* Turtle state transition rules
* Turtle command handlers
* Turtle-specific guards
* Turtle-specific errors

Not allowed inside `game-turtle-abstract`:

* Generic FSM engine
* Generic transition registry
* Generic state machine executor
* Generic guard pipeline
* Generic state transition result model

Those belong in `@monorepo/core-design-patterns`.

---

## 3. Formal Primitive Type Definitions

The turtle core must emit immutable, renderer-neutral primitives in turtle coordinate space.

All primitives are defined in 3D coordinates.

2D primitives are represented as 3D primitives constrained to the XY plane with `z = 0`.

## Required Primitive Types

* `LinePrimitive`
* `PolylinePrimitive`
* `CirclePrimitive`
* `PolygonPrimitive`

## Common Primitive Fields

Each primitive must include:

* `kind`
* `metadata`
* Required geometry fields
* Immutable value semantics
* JSON-compatible serialization shape

## Metadata Contract

Primitive metadata must be optional, immutable, renderer-neutral, and serializable.

Allowed fields:

```ts
type PrimitiveMetadata = {
  readonly id?: string;
  readonly tags?: readonly string[];
  readonly layer?: string | number;
  readonly userData?: Readonly<Record<string, unknown>>;
};
```

The turtle core must not auto-generate IDs unless an explicit deterministic ID strategy is injected.

Renderers may read metadata but must not mutate it.

## LinePrimitive

Required fields:

```ts
type LinePrimitive = {
  readonly kind: "line";
  readonly from: Vector3;
  readonly to: Vector3;
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};
```

## PolylinePrimitive

Required fields:

```ts
type PolylinePrimitive = {
  readonly kind: "polyline";
  readonly points: readonly Vector3[];
  readonly stroke: StrokeStyle;
  readonly metadata?: PrimitiveMetadata;
};
```

Rules:

* At least two points are required.
* Point order must be preserved.

## CirclePrimitive

Required fields:

```ts
type CirclePrimitive = {
  readonly kind: "circle";
  readonly center: Vector3;
  readonly radius: number;
  readonly normal: Vector3;
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};
```

Rules:

* Radius must be greater than zero.
* Normal must be valid and non-zero.
* In 2D mode, normal defaults to positive Z.

## PolygonPrimitive

Required fields:

```ts
type PolygonPrimitive = {
  readonly kind: "polygon";
  readonly points: readonly Vector3[];
  readonly stroke?: StrokeStyle;
  readonly fill?: FillStyle;
  readonly metadata?: PrimitiveMetadata;
};
```

Rules:

* At least three points are required.
* Point order must be preserved.
* Polygon closure is implicit.
* Renderer modules decide how to render fill and stroke.

---

## 4. Primitive Factory Contract

`game-turtle-abstract` must provide a `PrimitiveFactory`.

The primitive factory is responsible for creating immutable primitive value objects.

## Requirements

The primitive factory must:

* Create all supported primitive types deterministically
* Validate primitive parameters
* Use only turtle state and explicit method parameters
* Produce renderer-neutral primitives
* Return JSON-compatible primitive shapes
* Fail fast on invalid primitive parameters

The primitive factory must not:

* Contain renderer logic
* Contain coordinate mapping logic
* Access SVG, Canvas, WebGL, Lit, or DOM APIs
* Perform I/O
* Generate random values

---

## 5. Deterministic Output Rules

The turtle system must produce deterministic output.

## Requirements

* No randomness unless explicitly injected.
* Primitive ordering follows command execution order.
* Stack behavior is order-preserving.
* Math operations use `@monorepo/core-math`.
* Coordinate conversion uses `@monorepo/game-coordinate-system-and-mappers`.
* Serialization must provide stable numeric formatting.
* Renderers must provide stable output ordering.

## Numeric Formatting

Floating-point formatting is a serialization/rendering concern.

The turtle core stores numeric values as numbers.

Stable formatting must be handled by:

* Primitive serializers
* Renderer output formatters
* Test normalization utilities

---

## 6. Error Model

The system must define explicit domain errors.

## Required Error Types

### Turtle/Core Errors

* `PopEmptyStackError`
* `InvalidRotationError`
* `InvalidPrimitiveParameterError`

### Renderer Errors

* `MissingAdapterError`

### Mapping Errors

* `InvalidMapperResultError`

## Error Rules

Domain errors must:

* Fail fast
* Be deterministic
* Be testable
* Expose a stable error code
* Avoid renderer-specific leakage in turtle core errors

Programmer errors, such as invalid null or undefined dependencies, are separate from domain errors.

---

## 7. 2D API Surface Contract

The 2D API is a thin façade over the 3D turtle model.

2D mode must constrain movement to the XY plane.

## Required 2D Behavior

* Position uses `(x, y, 0)`.
* Rotation is around the positive Z axis.
* Heading `0°` points along positive X.
* Positive rotation is counterclockwise.
* `90°` points along positive Y.
* The up vector remains positive Z.

## Required 2D Commands

A 2D façade may expose:

* `forward(distance)`
* `move(distance)`
* `turnLeft(degrees)`
* `turnRight(degrees)`
* `penUp()`
* `penDown()`
* `pushState()`
* `popState()`

## 2D to 3D Mapping

```text
2D forward(distance)   -> 3D forward(distance) constrained to XY plane
2D move(distance)      -> 3D forward(distance) constrained to XY plane
2D turnLeft(degrees)   -> 3D rotation around +Z
2D turnRight(degrees)  -> 3D rotation around +Z
2D penUp()             -> 3D penUp()
2D penDown()           -> 3D penDown()
2D pushState()         -> 3D pushState()
2D popState()          -> 3D popState()
```

The preferred public API is a separate `ITurtle2D` façade instead of suffix-based methods such as `forward2D`.

---

## 8. Adapter Registration Mechanism

The turtle core must not know about renderer adapters.

Renderer modules own adapter registration.

## Renderer Module Requirements

A renderer module, such as `game-turtle-svg`, must:

* Implement concrete primitive adapters
* Own a local adapter registry
* Register adapters explicitly
* Resolve adapters by primitive kind or primitive type
* Throw `MissingAdapterError` when no adapter exists
* Keep adapter registration deterministic

## Rules

* No auto-discovery
* No global adapter registry
* No service locator
* No renderer dependency inside turtle core
* No mutation of primitives during rendering

If a reusable registry abstraction is needed, it must be implemented in `@monorepo/core-design-patterns` with unit tests before use.

---

## 9. Mapper Pipeline Contract

All coordinate mapping must use `@monorepo/game-coordinate-system-and-mappers`.

The turtle emits primitives only in turtle coordinate space.

Renderer modules define the mapper pipeline.

## Renderer Responsibilities

A renderer must define:

* Source coordinate system
* Target coordinate system
* Mapper order
* Mapper composition rules
* Validation of mapped output

Example pipeline:

```text
Turtle Space
  -> Game/World Space
  -> SVG Space
```

SVG Y-axis inversion must be handled by mappers, not by turtle math.

## Turtle Responsibilities

The turtle must:

* Emit primitives in turtle space
* Avoid coordinate-system conversion
* Avoid renderer-specific coordinate assumptions
* Avoid SVG-specific Y-axis logic

---

## 10. Turtle State Stack

The turtle implementation must support stack-based branching for L-systems.

## Required Commands

* `pushState()`
* `popState()`

## Stack Requirements

`pushState()` must save the complete renderer-neutral turtle state:

* Position
* Forward vector
* Left vector
* Up vector
* Pen state
* Stroke style
* Fill style
* Metadata context
* 2D/3D mode
* Active plane/projection configuration

`popState()` must restore the most recently pushed state.

Popping an empty stack must throw `PopEmptyStackError`.

The stack must not store renderer-specific state.

---

# game-turtle-svg

## Responsibility

`game-turtle-svg` is the SVG renderer implementation for `game-turtle-abstract`.

It converts abstract turtle primitives into SVG output.

The turtle itself is not animated.

Only the shapes produced by turtle movement are rendered.

## Required Dependencies

The SVG implementation must use:

```text
lit@3
@monorepo/game-design-svg
@monorepo/game-coordinate-system-and-mappers
@monorepo/core-design-patterns
game-turtle-abstract
```

## Required Capabilities

The SVG implementation must support:

* SVG document/view rendering
* Lit 3 component integration
* Rendering abstract primitives through adapters
* Reuse of `@monorepo/game-design-svg` primitives
* Coordinate mapping through `@monorepo/game-coordinate-system-and-mappers`
* Deterministic output for tests
* Extension through new SVG primitive adapters

## SVG Primitive Adapters

The module must provide SVG adapters such as:

* `SvgLinePrimitiveAdapter`
* `SvgPolylinePrimitiveAdapter`
* `SvgCirclePrimitiveAdapter`
* `SvgPolygonPrimitiveAdapter`

Each adapter must implement a common renderer-local primitive adapter contract.

If the adapter or registry abstraction is reusable, it must be implemented in `@monorepo/core-design-patterns`.

## Rendering Flow

The intended rendering flow is:

```text
Turtle commands
  -> abstract turtle primitives
  -> coordinate mapper pipeline
  -> SVG primitive adapters
  -> @monorepo/game-design-svg primitives
  -> Lit 3 SVG rendering
```

Example:

```text
forward(100)
  -> LinePrimitive
  -> mapped from turtle coordinates to SVG coordinates
  -> SvgLinePrimitiveAdapter
  -> game-design-svg line primitive
  -> rendered SVG output
```

## Design Rules

* SVG-specific logic must stay inside `game-turtle-svg`.
* Turtle movement logic must stay inside `game-turtle-abstract`.
* Coordinate conversion must use `game-coordinate-system-and-mappers`.
* SVG adapters must not mutate turtle state.
* SVG adapters must not mutate primitives.
* SVG rendering must be deterministic.
* SVG output must be testable.

## Non-Goals

`game-turtle-svg` must not:

* Parse L-system grammars
* Own turtle movement rules
* Own coordinate-system abstractions
* Depend on hidden global registries
* Animate the turtle object itself
* Bypass coordinate mappers
* Hardcode turtle-space-to-SVG conversion inside primitive adapters

---

# game-turtle-svg-l-system

## Responsibility

`game-turtle-svg-l-system` provides an SVG-based L-system implementation using the turtle subsystem.

It interprets L-system symbols into turtle commands and renders the resulting primitives through the SVG renderer.

## L-System Role

The L-system module must own:

* Axiom
* Alphabet
* Production rules
* Generation count
* Iteration/generation logic
* Symbol-to-command interpretation
* Turtle command dispatch

The turtle module must only execute commands.

It must not know that the commands came from an L-system.

## Design Pattern Rule

If the L-system implementation uses reusable Command, Interpreter, Strategy, or Composite abstractions, those reusable abstractions must come from:

```text
@monorepo/core-design-patterns
```

L-system-specific symbols, production rules, interpreters, and command mappings remain inside `game-turtle-svg-l-system`.

## Required Flow

```text
L-system axiom
  -> production rules
  -> generated symbol sequence
  -> symbol interpreter
  -> turtle commands
  -> abstract primitives
  -> mapper pipeline
  -> renderer adapters
  -> rendered output
```

## Open–Closed Design

Concrete L-system implementations must be extendable without changing the turtle core.

Adding a new L-system should require:

1. A new rule set
2. A new symbol interpreter
3. Optional rendering configuration

It must not require changes to:

* Turtle state management
* Primitive contracts
* SVG primitive adapters
* Coordinate mapper contracts

## Non-Goals

`game-turtle-svg-l-system` must not:

* Reimplement turtle movement
* Reimplement coordinate mapping
* Render SVG primitives directly
* Bypass primitive adapters
* Mutate turtle primitives
* Add renderer-specific behavior to turtle core

---

# Acceptance Criteria

## Coordinate Mapping

* Turtle/game coordinates can be mapped to SVG coordinates.
* SVG Y-axis inversion is handled by mapper logic.
* No turtle command contains SVG-specific coordinate assumptions.
* No turtle or renderer module duplicates coordinate-system, axis, interval, or mapper abstractions already owned by `game-coordinate-system-and-mappers`.

## Design Patterns

* Reusable design pattern implementations live in `@monorepo/core-design-patterns`.
* New reusable patterns include unit tests before use by feature modules.
* Feature modules do not implement local reusable FSM, Strategy, Adapter, Factory, Registry, Composite, Command, or Interpreter frameworks.
* Turtle-specific, SVG-specific, and L-system-specific behavior stays in the owning feature module.

## Turtle Core

* Turtle state is 3D by default.
* 2D mode is represented as XY-plane movement with `z = 0`.
* Default heading is positive X.
* Default up vector is positive Z.
* Heading rotation is counterclockwise in the XY plane.
* 2D commands are implemented through the same 3D state model.
* Turtle can move and turn deterministically.
* Turtle can emit abstract primitives.
* Pen up/down affects whether movement creates primitives.
* Turtle state can be pushed and popped.
* Turtle state can be reset.
* Turtle core has no dependency on SVG, Canvas, WebGL, Lit, or DOM APIs.
* Turtle core does not implement reusable design pattern infrastructure locally.

## Math

* All vector, matrix, rotation, projection, normalization, distance, and geometry calculations use `@monorepo/core-math`.
* Turtle core contains no custom vector implementation.
* Turtle core contains no custom coordinate-mapping implementation.

## Primitive Model

* Turtle emits renderer-neutral primitives.
* Turtle can create lines, polylines, circles, and polygons as abstract primitives.
* Primitives are immutable.
* Primitives are serializable.
* Primitive ordering follows command execution order.
* Renderer-specific primitive conversion is handled by adapters.

## SVG Renderer

* SVG implementation uses Lit 3.
* SVG implementation uses `@monorepo/game-design-svg`.
* SVG rendering supports extension through new primitive adapters.
* SVG renderer owns adapter registration.
* SVG module does not mutate turtle state.
* SVG module does not mutate primitives.
* SVG output is deterministic and testable.

## Stack

* `pushState()` saves the full renderer-neutral turtle state.
* `popState()` restores the full renderer-neutral turtle state.
* Stack behavior is deterministic.
* Popping an empty stack fails with `PopEmptyStackError`.
* Stack state is renderer-neutral.

## L-System Integration

* L-system generation is separated from turtle movement.
* Symbol interpretation is separated from production rules.
* L-system output can drive the turtle without modifying turtle core.
* SVG L-system rendering uses the same turtle, mapper, and SVG adapter pipeline.
* Reusable Interpreter, Command, Strategy, or Composite abstractions are sourced from `@monorepo/core-design-patterns` when needed.

---

# Final Design Principle

Turtle emits intent.

Mapper converts space.

Renderer adapts primitives.

L-system generates commands.

Reusable patterns belong in `@monorepo/core-design-patterns`.

Domain behavior belongs in the owning domain module.

```
```
## New

````md
# Shape Stack and Shape Library Requirements

## Purpose

The turtle system must support reusable renderer-neutral shapes in addition to the existing turtle state stack.

The existing turtle stack stores turtle state only.  
The new shape stack stores reusable shapes.

---

## 1. Shape Stack

The system must provide a separate shape stack.

The shape stack must store renderer-neutral shapes or shape instances.

It must not replace or modify the turtle state stack.

### Required Commands

```text
pushShape <shape-id>
popShape
stampShape
rotateShape <degrees>
scaleShape <factor>
translateShape <x> <y>
````

### Rules

* `pushShape` pushes a shape onto the shape stack.
* `popShape` removes the top shape from the shape stack.
* `stampShape` emits the top shape into the turtle output.
* `stampShape` must not remove the shape from the stack.
* Shape stack operations must not mutate turtle state unless explicitly defined.
* Shape stack order must be deterministic.
* Shape stack state must be renderer-neutral.

---

## 2. Shape Model

A shape must be a renderer-neutral immutable value object.

```ts
type TurtleShape = {
  readonly id: string;
  readonly primitives: readonly TurtlePrimitive[];
  readonly origin: Vector3;
  readonly metadata?: PrimitiveMetadata;
};
```

A shape must not depend on:

* SVG
* Lit
* DOM
* Canvas
* WebGL
* renderer adapters

---

## 3. Shape Library

The system must provide a shape library for named reusable shapes.

### Required Interface

```ts
export interface IShapeLibrary {
  get(id: string): TurtleShape;
  has(id: string): boolean;
  list(): readonly TurtleShapeDescriptor[];
}
```

```ts
export type TurtleShapeDescriptor = {
  readonly id: string;
  readonly name: string;
  readonly primitiveKinds: readonly string[];
  readonly metadata?: PrimitiveMetadata;
};
```

### Rules

* Shape lookup must be deterministic.
* Missing shape lookup must fail with `ShapeNotFoundError`.
* Shape library must return immutable shapes.
* Shape library must not mutate shapes after registration.
* Shape library must not depend on renderer-specific code.

---

## 4. Push Shape From Shape Library

The system must support pushing a named shape from the shape library to the shape stack.

### Required Command

```text
pushLibraryShape <shape-id>
```

Alias:

```text
pushShapeFromLibrary <shape-id>
```

### Behavior

```text
pushLibraryShape triangle
```

must:

1. Resolve `triangle` from the shape library.
2. Push the resolved shape onto the shape stack.
3. Leave turtle state unchanged.

If the shape does not exist, the command must fail with `ShapeNotFoundError`.

---

## 5. Capture Current Drawing as Shape

The system must support capturing turtle output as a reusable shape.

### Required Commands

```text
beginShape <shape-id>
endShape
```

### Behavior

```text
beginShape triangle
forward 120
left 120
forward 120
left 120
forward 120
endShape
```

must create a reusable shape named `triangle`.

Captured primitives must be stored relative to the shape origin.

### Rules

* `beginShape` starts shape capture mode.
* `endShape` ends shape capture mode.
* Captured primitives must be renderer-neutral.
* Captured primitives must be immutable.
* Nested shape capture is not allowed unless explicitly added later.
* Invalid capture nesting must fail with `InvalidShapeDefinitionError`.

---

## 6. Stamp Shape

The system must support stamping the current top shape from the shape stack into turtle output.

### Required Command

```text
stampShape
```

### Behavior

```text
pushLibraryShape triangle
stampShape
left 30
stampShape
left 30
stampShape
```

must draw three stamped triangle instances using the current turtle orientation.

### Rules

* `stampShape` must fail if the shape stack is empty.
* `stampShape` must append primitives to turtle output.
* `stampShape` must apply current turtle position and orientation.
* Stamped primitives must be independent immutable copies.
* Original shape definitions must never be mutated.

---

## 7. Shape Transform Commands

The system must support transformations on the shape stack frame.

### Required Commands

```text
rotateShape <degrees>
scaleShape <factor>
translateShape <x> <y>
```

### Shape Stack Frame

```ts
type ShapeStackFrame = {
  readonly shape: TurtleShape;
  readonly transform: ShapeTransform;
};
```

```ts
type ShapeTransform = {
  readonly rotationDegrees: number;
  readonly scale: number;
  readonly translation: Vector3;
};
```

### Rules

* Transform commands modify the top shape stack frame.
* Transform commands must not mutate the original shape definition.
* Rotation must be finite.
* Scale must be finite and greater than zero.
* Translation must be finite.
* Invalid values must fail with `InvalidShapeTransformError`.

---

## 8. Required Errors

```text
ShapeStackEmptyError
ShapeNotFoundError
InvalidShapeTransformError
InvalidShapeDefinitionError
```

---

## 9. Module Ownership

### game-turtle-abstract owns

* `TurtleShape`
* shape stack abstraction
* shape library abstraction
* shape capture model
* shape stamping model
* shape transform model
* shape domain errors

### game-turtle-svg owns

* adapting resulting primitives to SVG
* rendering stamped output through primitive adapters
* using `@monorepo/game-design-svg`

### turtle.app owns

* shape selector UI
* command editor UI
* user interaction
* selected shape command insertion

---

## 10. Acceptance Criteria

* Shapes can be pushed to a shape stack.
* Shapes can be popped from a shape stack.
* Shapes can be pushed from the shape library.
* Missing shape lookup fails with `ShapeNotFoundError`.
* Empty shape stack pop fails with `ShapeStackEmptyError`.
* `beginShape` and `endShape` can capture reusable shapes.
* `stampShape` emits the top shape without removing it.
* Shape transformations are deterministic.
* Shape definitions are immutable.
* Shape stack does not interfere with turtle state stack.
* Shape library and shape stack remain renderer-neutral.

---

# Shape Library Brush Requirements

## Purpose

Shapes in the shape library must be usable as turtle brushes.

A brush is a reusable renderer-neutral shape that is stamped along a turtle movement path.

The brush size must be configurable independently on the X and Y axes.

---

## 1. Shape Library Brushes

Every shape stored in the shape library must be eligible for use as a brush.

### Required Command

```text
brush <shape-id>
```

Example:

```text
brush circle
forward 100
```

If `circle` exists in the shape library, it becomes the active brush.

### Rules

* Brush lookup uses the shape library.
* Missing brush shape must fail with `ShapeNotFoundError`.
* Active brush state must be renderer-neutral.
* The brush must not mutate the source shape definition.
* The same library shape may be reused by multiple brush instances.

---

## 2. Brush Size

The active brush must support independent X/Y size scaling.

### Required Commands

```text
brushSize <x> <y>
brushWidth <x>
brushHeight <y>
```

Examples:

```text
brush circle
brushSize 1 1
forward 100
```

```text
brush rectangle
brushSize 4 2
forward 100
```

```text
brush ellipse
brushWidth 6
brushHeight 2
forward 100
```

### Rules

* Brush width must be finite and greater than zero.
* Brush height must be finite and greater than zero.
* `brushSize x y` sets both width and height.
* `brushWidth x` only changes brush width.
* `brushHeight y` only changes brush height.
* Brush size affects stamped instances, not the source shape definition.
* Brush size must be saved/restored by the turtle state stack.

---

## 3. Brush State Model

The turtle state must include active brush state.

```ts
type TurtleBrushState = {
  readonly shapeId: string;
  readonly shape: TurtleShape;
  readonly size: BrushSize;
  readonly step: number;
  readonly alignToHeading: boolean;
};
```

```ts
type BrushSize = {
  readonly x: number;
  readonly y: number;
};
```

### Rules

* `shape` is the immutable library shape definition.
* `size` is applied when stamping.
* `step` controls placement frequency along movement.
* `alignToHeading` controls whether the brush rotates with turtle heading.
* Brush state is immutable.
* Brush state is copied when pushed to turtle state stack.

---

## 4. Brush Step

The brush must support deterministic sampling along movement.

### Required Command

```text
brushStep <distance>
```

Example:

```text
brush circle
brushSize 1 1
brushStep 1
forward 100
```

Expected output:

```text
100 circle stamps
```

### Stamp Count Rule

```text
stampCount = floor(abs(distance) / brushStep)
```

### Rules

* Step must be finite and greater than zero.
* Stamp order follows movement direction.
* Forward and backward movement must both work deterministically.
* The turtle final position is unchanged by brush mode.

---

## 5. Brush Alignment

The active brush must support optional alignment to turtle heading.

### Required Command

```text
brushAlignToHeading <true|false>
```

### Rules

* `true` means stamped shapes rotate with turtle heading.
* `false` means stamped shapes keep their library orientation.
* Default is `true`.
* Alignment affects stamped instances only.
* Source shape definitions are never mutated.

---

## 6. Movement Behavior With Brush

When a non-line brush is active, movement emits repeated stamped shapes instead of a single line.

Example:

```text
brush circle
brushSize 1 1
brushStep 1
forward 100
```

Expected behavior:

* Turtle moves 100 units.
* 100 brush instances are emitted.
* Each instance uses the `circle` shape from the shape library.
* Each instance is scaled to size `(1, 1)`.
* No line primitive is emitted unless the active brush is `line`.

---

## 7. Default Brush

The default brush must be `line`.

```text
brush line
```

Default behavior:

```text
forward 100
```

emits one line from start to end.

### Rules

* Existing line drawing behavior must remain unchanged.
* Line brush may ignore `brushSize`.
* Line brush may use `stroke` and `stroke-width` as before.

---

## 8. Pen State

Brush drawing must respect pen state.

```text
penup
brush circle
brushSize 1 1
forward 100
```

Expected behavior:

* Turtle moves 100 units.
* No brush stamps are emitted.

```text
pendown
forward 100
```

Expected behavior:

* Brush stamping resumes.

---

## 9. Shape Library Ownership

The shape library owns reusable shape definitions.

The active brush owns brush-specific runtime configuration:

* selected shape id
* selected shape definition
* brush size
* brush step
* brush alignment

Changing brush size must not modify the shape library.

---

## 10. Required Errors

```text
ShapeNotFoundError
InvalidBrushSizeError
InvalidBrushStepError
InvalidBrushStateError
```

### Rules

* Missing shape ids fail with `ShapeNotFoundError`.
* Width or height less than or equal to zero fails with `InvalidBrushSizeError`.
* Non-finite width or height fails with `InvalidBrushSizeError`.
* Step less than or equal to zero fails with `InvalidBrushStepError`.
* Non-finite step fails with `InvalidBrushStepError`.

---

## 11. Example Commands

### Circle brush, 100 stamps

```text
brush circle
brushSize 1 1
brushStep 1
forward 100
```

### Rectangle brush, stretched X/Y

```text
brush rectangle
brushSize 4 2
brushStep 4
forward 100
```

### Ellipse brush

```text
brush ellipse
brushSize 6 2
brushStep 3
forward 90
```

### Shape from library as rotated brush

```text
brush triangle
brushSize 10 10
brushStep 12
brushAlignToHeading true
forward 120
left 90
forward 120
```

---

## 12. Acceptance Criteria

* Any shape in the shape library can be selected as a brush.
* `brush <shape-id>` resolves a shape from the shape library.
* `brushSize x y` changes active brush size without mutating the source shape.
* `brush circle` + `brushSize 1 1` + `brushStep 1` + `forward 100` emits 100 stamps.
* Brush width and height can be changed independently.
* Brush stamping respects pen up/down.
* Brush state is saved/restored by turtle state stack.
* Brush output is deterministic.
* Brush output is renderer-neutral.
* Missing brush shape fails deterministically.

---

# Shape Persistence Requirements

## Purpose

The turtle canvas must support saving newly created shapes into the shape library.

Saved shapes must be reusable as brushes and shape-stack entries.

---

## 1. Save Shape From Canvas

The UI must provide a save option for persisting the current drawing or selected primitives as a named shape.

### Required UI Action

```text
Save Shape
```

### Required Input

* shape id
* display name
* optional description
* optional tags
* selected primitives or current canvas primitives
* optional overwrite flag

### Behavior

Saving a shape must:

1. Collect renderer-neutral turtle primitives.
2. Normalize them into shape-local coordinates.
3. Create an immutable `TurtleShape`.
4. Send the shape to the persistence boundary.
5. Register the saved shape in the shape library.
6. Make the shape immediately available as a brush.

---

## 2. Backend-for-Frontend Requirement

If shapes must persist beyond the browser session, the app must use a backend-for-frontend.

The BFF owns persistence concerns.

The frontend must not write directly to files, databases, or repositories.

### BFF Responsibilities

The BFF must:

* save shapes
* load shapes
* list shapes
* update shapes
* delete shapes
* validate shape definitions
* assign or verify shape ids
* protect against invalid primitive data
* return deterministic JSON responses

### Frontend Responsibilities

The frontend must:

* collect shape data
* call BFF endpoints
* display validation errors
* update the local shape list after save
* avoid persistence logic inside Lit components

---

## 3. Shape Persistence Contract

Saved shapes must use a renderer-neutral JSON format.

```ts
export type PersistedTurtleShape = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly origin: Vector3;
  readonly primitives: readonly TurtlePrimitive[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
};
```

Rules:

* Shape JSON must not contain SVG.
* Shape JSON must not contain Lit templates.
* Shape JSON must not contain DOM references.
* Shape JSON must not contain renderer-specific adapter data.
* Shape JSON must be deterministic and testable.

---

## 4. Required BFF API

```text
GET    /api/shapes
GET    /api/shapes/{id}
POST   /api/shapes
PUT    /api/shapes/{id}
DELETE /api/shapes/{id}
```

### Save Shape

```http
POST /api/shapes
Content-Type: application/json
```

```json
{
  "id": "triangle",
  "name": "Triangle",
  "description": "Reusable triangle brush",
  "tags": ["brush", "polygon"],
  "origin": { "x": 0, "y": 0, "z": 0 },
  "primitives": []
}
```

---

## 5. Local Draft Storage

The frontend may use IndexedDB for unsaved drafts.

IndexedDB is allowed for:

* draft shapes
* autosave
* offline editing
* temporary local cache

IndexedDB must not be treated as the canonical shared shape library unless the product explicitly supports local-only mode.

---

## 6. Shape Library Integration

After saving a shape successfully:

* the shape must appear in the shape list
* the shape must be selectable as a brush
* `brush <shape-id>` must resolve the saved shape
* `pushLibraryShape <shape-id>` must resolve the saved shape
* existing turtle primitives must remain unchanged

---

## 7. Acceptance Criteria

* User can save the current canvas output as a named shape.
* Saved shape is persisted through the BFF.
* Saved shape is renderer-neutral.
* Saved shape appears in the shape library after save.
* Saved shape can be selected as a brush.
* Saved shape can be pushed to the shape stack.
* Invalid shapes are rejected by the BFF.
* Frontend does not own persistence logic.
* Backend does not own rendering logic.

---

# Recommended Architecture

```text
turtle.app
  components/
    turtle-workbench
    turtle-command-editor
    turtle-svg-viewer
    svg-shape-list
    save-shape-dialog

  application/
    ShapeSaveApplicationService
    ShapeLibraryClient

BFF
  ShapeController
  ShapeValidationService
  ShapeRepository

Storage
  JSON files or database
```

---

# Final Rule

Turtle state stack stores turtle state.

Shape stack stores reusable shapes.

Shape library stores named shape definitions.

Shape brushes stamp shape instances along movement paths.

Persistence belongs behind a BFF when shapes must survive browser sessions or be shared.

```
```
# Brushes, shapes, and stamps are the new primitives.

The "game-design-svg shape library" should be replaced by a "brush" presenter.  
- The brush presenter should use already defineds svg shapes.

# Download the "SVG result" as an SVG file. 
- The application should offer a "Download SVG" button that allows users to download the current canvas output as an SVG file.

