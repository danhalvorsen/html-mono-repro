# Plot Demo Host

This application is the Lit 3 multi-view demo host for `@monorepo/core-plot`.

It exists to show sprint deliveries as separate views inside one running application instead of
creating a new app per demo.

## Purpose

The host provides:

* one application shell
* one navigation model
* one route per sprint or focused delivery
* isolated demo views that can evolve independently

Current routes:

* `#sprint-1`
* `#sprint-2`
* `#sprint-3`
* `#sprint-3-1`

## Structure

Main files:

* [src/my-element.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/Applications/plot/vite-project/src/my-element.ts:1)
* [src/views/demo-shell-view.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/Applications/plot/vite-project/src/views/demo-shell-view.ts:1)
* `src/views/sprint-one-view.ts`
* `src/views/sprint-two-view.ts`
* `src/views/sprint-three-view.ts`
* `src/views/sprint-three-one-view.ts`

Responsibility split:

* `my-element.ts`
  Handles route detection from `window.location.hash` and chooses which view to render.
* `demo-shell-view.ts`
  Renders the shared application shell, top bar, and route navigation.
* `src/views/*`
  Each file is one delivery-specific Lit view.

## Multi-View Concept

The app uses a simple hash-router.

Example:

* `http://localhost:5174/#sprint-1`
* `http://localhost:5174/#sprint-3-1`

Why hash routing is used:

* simple local development
* no server-side route configuration needed
* sprint demos can be linked directly
* route state is easy to inspect and change

The routing flow is:

1. `readRoute()` maps the hash to a typed route id.
2. `MyElement` stores the active route in `currentRoute`.
3. `MyElement` renders `<demo-shell-view>`.
4. The selected sprint view is rendered inside the shell slot.

## How To Add A New View

Example target: `Sprint 4 Delivery`

1. Create a new view file under `src/views/`.

Recommended naming:

* `sprint-four-view.ts`
* or another delivery-focused name if the route is narrower than a full sprint

2. Define and register a Lit custom element in that file.

Example shape:

```ts
import { LitElement, html } from "lit";

export class SprintFourView extends LitElement {
  protected override render() {
    return html`<section>Sprint 4 Delivery</section>`;
  }
}

customElements.define("sprint-four-view", SprintFourView);
```

3. Import the new file in [src/my-element.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/Applications/plot/vite-project/src/my-element.ts:1).

4. Extend the `DemoRoute` union.

Example:

```ts
type DemoRoute =
  | "sprint-1"
  | "sprint-2"
  | "sprint-3"
  | "sprint-3-1"
  | "sprint-4";
```

5. Update `readRoute()` so the new hash resolves.

6. Extend the render branch in `MyElement` to render the new view.

7. Add a navigation link in [src/views/demo-shell-view.ts](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/Applications/plot/vite-project/src/views/demo-shell-view.ts:1).

## View Design Rules

A sprint view should:

* be self-contained
* demonstrate one delivery clearly
* use `plot-canvas` or other `core-plot` exports directly where possible
* avoid re-implementing package behavior that should live in `core-plot`
* keep demo-only helpers local to the view if they are not product code

Practical rule:

* if logic is meant to become reusable product behavior, move it into `packages/core-plot`
* if logic only exists to explain or showcase a delivery, keep it in the demo view

## Recommended Pattern

When building a new delivery view:

* add a short intro panel
* add one or more focused demos
* add a scope panel that says what the view is proving

This keeps each route readable and useful during sprint reviews.

## Running The Demo

Development:

```bash
pnpm --dir Applications/plot/vite-project dev
```

Production build:

```bash
pnpm --dir Applications/plot/vite-project build
```

## Notes

This app is a demo host, not the product architecture root.

That means:

* routing and shell composition belong here
* plotting runtime behavior belongs in `packages/core-plot`
* a view should prove package behavior, not hide missing package behavior behind too much local demo code
