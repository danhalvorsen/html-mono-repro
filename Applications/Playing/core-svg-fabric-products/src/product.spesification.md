Below is a **developer-grade specification** aligned with your architectural constraints (SOLID, composition-first, no magic strings, extensible, Lit-based rendering, core-driven).

---

# SVG Library – Developer Specification

## 1. Purpose

Define a **composition-first SVG component system** built on top of
core-svg-fabric

The system must:

* Produce **Lit-based SVG Web Components**
* Enforce **deterministic rendering**
* Support **extensibility via composition**, not inheritance
* Keep **rendering concerns separate from geometry and behavior**

---

## 2. Architectural Constraints

### 2.1 Core Principles

* **Single Responsibility**

  * Geometry ≠ Rendering ≠ Interaction
* **Open/Closed**

  * Extend via new builders, strategies, controllers
* **Dependency Inversion**

  * All components depend on abstractions (`interfaces`)
* **No runtime string contracts**

  * Use enums / value objects / typed keys
* **No hidden state**

  * All rendering must be derived from input state

---

## 3. Layered Architecture

```
[ Application / Feature Layer ]
        ↓
[ Component Layer (Lit Elements) ]
        ↓
[ Composition Layer (core-svg-fabric usage) ]
        ↓
[ Primitive Layer (geometry + builders) ]
```

---

## 4. Core Concepts

### 4.1 SVG Composition Model

The system MUST use a **fabric-style composition pipeline**:

```ts
interface ISvgNode {
  readonly children: readonly ISvgNode[];
  readonly transform: Matrix3x3;
  readonly style: ISvgStyle;
}
```

* Immutable
* No DOM dependency
* Serializable

---

### 4.2 Builders (Primary Extension Point)

All shapes must be created via builders.

```ts
interface ISvgBuilder<TNode extends ISvgNode> {
  build(): TNode;
}
```

#### Example responsibilities:

* Geometry creation
* Transform composition
* Style assignment

---

### 4.3 Composition Over Shape Explosion

❌ Avoid:

```
RectangleBuilder
CircleBuilder
EllipseBuilder
...
```

✅ Prefer:

```
PolygonBuilder (core)
+ ShapeFactories (adapters)
```

---

## 5. Lit Integration Layer

### 5.1 Web Component Contract

All components must implement:

```ts
interface ISvgComponent {
  readonly node: ISvgNode;
}
```

### 5.2 Base Class

```ts
abstract class SvgLitElement extends LitElement {
  protected abstract renderNode(): ISvgNode;

  protected render(): TemplateResult {
    return this.renderSvg(this.renderNode());
  }

  protected abstract renderSvg(node: ISvgNode): TemplateResult;
}
```

---

### 5.3 Rendering Rule

* Rendering must be **pure projection**
* No mutation inside `render()`
* No business logic in Lit layer

---

## 6. Composition Strategy

### 6.1 Component Composition

Components MUST be built from smaller units:

```
Button
 ├─ BackgroundShape
 ├─ Label
 ├─ InteractionController
```

Each part:

* Independent
* Replaceable
* Testable

---

### 6.2 Reuse Strategy

* Shared primitives via `core-svg-fabric`
* Shared styles via factories
* Shared transforms via utilities

---

## 7. Transformation Model

All positioning must use:

```
Matrix3x3
```

Never:

* Raw x/y mutation
* Implicit transforms

---

## 8. Interaction Model

### 8.1 Controllers (Lit Reactive Controllers)

Encapsulate behavior:

```ts
interface ISvgController {
  attach(host: ReactiveControllerHost): void;
}
```

Examples:

* Click controller
* Drag controller
* Animation controller

---

### 8.2 Rule

* Controllers **must not render**
* Controllers **must not own geometry**
* Controllers only modify **state inputs**

---

## 9. Public API Design

### 9.1 Strict Surface

Expose ONLY:

* Builders
* Component inputs (props)
* Typed events

### 9.2 Example

```ts
interface IButtonProps {
  readonly value: number;
  readonly isActive: boolean;
}
```

---

## 10. Data Flow

```
Input Props
   ↓
Builder / Composition
   ↓
ISvgNode Tree
   ↓
Lit Renderer
   ↓
DOM (SVG)
```

No reverse mutation allowed.

---

## 11. Extensibility Model

### 11.1 Add New Shape

* Implement builder
* Register in factory
* No modification of existing code

---

### 11.2 Add New Behavior

* Implement controller
* Attach to component
* No modification of component internals

---

## 12. Testing Strategy

### 12.1 Unit Tests

* Builders → deterministic output
* Transform → matrix correctness
* Composition → structure equality

### 12.2 Component Tests

* Render snapshot (SVG)
* Event emission
* Controller behavior

---

## 13. Non-Functional Requirements

* Deterministic output (same input → same SVG)
* No runtime allocation spikes
* No hidden global state
* Tree must be serializable

---

## 14. Anti-Patterns (Forbidden)

* ❌ DOM manipulation inside builders
* ❌ Mutable shared objects
* ❌ Magic strings (IDs, types)
* ❌ Shape-per-class explosion
* ❌ Logic inside Lit templates
* ❌ Tight coupling between controller and rendering

---

## 15. Minimal Example Flow

```
PolygonBuilder → ISvgNode
       ↓
Composed into ButtonNode
       ↓
Rendered by SvgLitElement
       ↓
Controlled by ClickController
```

---

## 16. Clarification Required (before code)

You need to confirm:

1. Do you want:

   * **Single generic PolygonBuilder only**, or
   * A thin layer of semantic factories (RectangleFactory, CircleFactory)?

2. Should:

   * Transform be strictly **Matrix3x3 only**, or allow helpers (translate/rotate wrappers)?

3. Rendering:

   * Direct SVG template mapping, or
   * Intermediate virtual node → renderer adapter?

---

Once confirmed, I’ll produce a **production-grade implementation (single snippet, DI-ready, testable)**.
