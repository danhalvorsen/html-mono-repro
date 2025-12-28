
# Cartesian Turtle Drawing → SVG Points

This module provides a **turtle-style drawing API** operating in a **standard Cartesian coordinate system** with origin `(0,0)` at the center of a logical rectangle.
SVG is treated purely as an **output adapter**, not as the working coordinate system.

The result is a deterministic, testable geometry pipeline suitable for SVG, Canvas, or WebGL.

---

## Coordinate Model

* **Cartesian system**

  * Origin `(0,0)` at center
  * X increases to the right
  * Y increases upward
* **SVG mapping**

  * Origin at top-left
  * Y axis inverted
  * Handled exclusively by `CenteredCartesianMapper`

The turtle itself never knows about SVG.

---

## Example: Generating SVG-Ready Points

```ts
import { Turtle, CenteredCartesianMapper, type Point } from "your-package";
```

### 1. Define the SVG viewport

The mapper defines how Cartesian coordinates are projected into SVG user space.

```ts
const mapper = new CenteredCartesianMapper({
    width: 800,
    height: 600
});
```

This places the Cartesian origin `(0,0)` at the center of an `800×600` SVG.

---

### 2. Create the turtle

The turtle operates purely in Cartesian space.

```ts
const turtle = new Turtle();
```

Initial state:

* Position: `(0,0)`
* Heading: `0°` (positive X axis)

---

### 3. Collect SVG-ready points

```ts
const svgPath: Point[] = [];
```

Start at the origin:

```ts
svgPath.push(mapper.toSvg(turtle.position));
```

---

### 4. Draw using turtle commands

```ts
turtle.forward(120);
svgPath.push(mapper.toSvg(turtle.position));

turtle.turn(90);
turtle.forward(80);
svgPath.push(mapper.toSvg(turtle.position));
```

---

### 5. Use push / pop for branching

Push and pop allow temporary transformations without losing the main path.

```ts
turtle.push();
turtle.turn(-45);
turtle.forward(60);
svgPath.push(mapper.toSvg(turtle.position));
turtle.pop();
```

Continue drawing in the original direction:

```ts
turtle.forward(40);
svgPath.push(mapper.toSvg(turtle.position));
```

---

## Result

`svgPath` now contains points that are ready to be consumed by rendering layers:

* SVG `<path d="M … L …">`
* Gradient geometry (linear / radial)
* Canvas adapters
* WebGL adapters

```ts
[
  { x: 400, y: 300 },
  { x: 520, y: 300 },
  { x: 520, y: 220 },
  { x: 562, y: 262 },
  { x: 520, y: 180 }
]
```

---

## Design Guarantees

* No SVG math inside the turtle
* Deterministic push / pop semantics
* Origin-centric Cartesian modeling
* Open for extension (arcs, curves, cameras)
* Rendering backend agnostic

---

If you want, the next README sections can cover:

* Turtle → SVG path builder
* Gradient integration
* Coordinate stack vs turtle stack
* Canvas / WebGL adapters
