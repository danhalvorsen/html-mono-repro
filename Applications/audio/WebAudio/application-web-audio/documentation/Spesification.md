### Specification — `MrCanvas`

#### Component lifecycle

* **should** create and own a `<canvas>` element used for rendering shapes
* **should** hide slotted DOM content used as the declarative shape model
* **should** attach the `MouseController` to the canvas element on first render
* **should** create and register `DragController`, `MouseController`, and `ShapeController`
* **should** detach the `MouseController` when the component disconnects from the DOM
* **should** release the `ResizeObserver` when the component disconnects

---

#### Slot and shape management

* **should** treat slotted elements as the declarative shape tree
* **should** resolve shapes using `ShapeController`
* **should** ignore non-shape elements in the slot
* **should** redraw the canvas when slot content changes
* **should** redraw the canvas when the component updates

---

#### Canvas sizing

* **should** resize the internal canvas to match the host element dimensions
* **should** apply device pixel ratio scaling to the rendering context
* **should** update the canvas resolution when the host size changes
* **should** use `ResizeObserver` to detect host size changes

---

#### Rendering pipeline

* **should** clear the canvas before each draw pass
* **should** iterate through shapes resolved by `ShapeController`
* **should** call `shape.draw(context)` for each shape
* **should** provide the rendering context `{ canvas, ctx }` to shapes
* **should** render shapes in DOM slot order

---

#### Input handling

* **should** convert `MouseEvent` coordinates to canvas-relative coordinates
* **should** forward pointer events to `MouseController`
* **should** allow `MouseController` to delegate drag operations to `DragController`

---

#### Drag behaviour

* **should** allow draggable elements to be discovered through DOM traversal
* **should** not implement dragging logic inside `MrCanvas`
* **should** delegate drag logic entirely to `DragController`
* **should** trigger a canvas redraw when dragging updates a shape

---

#### Drawing consistency

* **should** maintain deterministic draw order based on slot order
* **should** support nested structures where shapes are contained inside other DOM elements
* **should** remain stateless with respect to shape geometry

---

#### Architectural constraints

* **should** treat shapes as domain objects responsible for their own drawing
* **should** avoid performing geometry calculations inside `MrCanvas`
* **should** rely on controllers (`ShapeController`, `MouseController`, `DragController`) for behavior orchestration
* **should** act as the rendering host and orchestration boundary only

---

If useful, the next logical step is to define the **test specification for `MrCanvas`** using the same **`should`-style Vitest structure**, which can directly drive unit tests.
