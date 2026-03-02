# Composing Applications with the Composite Tree and Lit 3

This guide explains how to build applications using the **Composite pattern** implemented
in `@monorepo/core-design-composite`. The library provides a declarative, immutable
component tree that renders into Lit 3 web components using slot-based composition.

**Reference implementation:** `composistion-demo-02`

---

## Architecture Overview

The system has three layers that work together:

```
Layer 1: Composite Tree       (TypeScript classes - declarative UI structure)
Layer 2: DOM Generation        (createElement() - builds light-DOM tree)
Layer 3: Web Components        (Lit 3 elements - rendering via <slot>)
```

### How the layers connect

```
  Composite Tree (model)
        |
        |  .createElement()
        v
  Light-DOM elements (<ui-box>, <ui-label>, ...)
        |
        |  <slot> projection
        v
  Shadow-DOM rendering (styles, layout, behavior)
```

---

## Core Abstractions

### Component (interface)

Every node in the tree implements `Component`:

```typescript
// core/component.ts
export interface Component {
    readonly name: string;
    readonly children: ReadonlyArray<Component>;
    createElement(): HTMLElement;
}
```

### Composite (abstract class)

A node that **contains children**. Used for layout containers and behavior wrappers.
Subclasses implement `createHostElement()` to specify which HTML element to create.
The base class handles appending children as light-DOM nodes.

```typescript
// core/composite.ts
export abstract class Composite implements Component {
    constructor(
        public readonly name: string,
        private readonly nodes: ReadonlyArray<Component> = []
    ) {}

    get children(): ReadonlyArray<Component> {
        return this.nodes;
    }

    add(child: Component): this {
        const Ctor = this.constructor as unknown as CompositeCtor<this>;
        return new Ctor(this.name, [...this.nodes, child]);
    }

    protected abstract createHostElement(): HTMLElement;

    createElement(): HTMLElement {
        const host = this.createHostElement();
        for (const child of this.children) {
            host.appendChild(child.createElement());
        }
        return host;
    }
}
```

Key points:
- `.add()` returns a **new instance** (immutable tree)
- `createElement()` recursively builds the entire DOM subtree
- Children are appended as **light-DOM** so the web component's `<slot>` renders them

### Leaf (abstract class)

A **terminal node** with no children. Used for labels, inputs, spacers, dividers, etc.

```typescript
// core/leaf.ts
export abstract class Leaf implements Component {
    constructor(public readonly name: string) {}

    get children(): ReadonlyArray<Component> {
        return [];
    }

    abstract createElement(): HTMLElement;
}
```

---

## Available Components

### Layout (Composite)

| Class | Element | Purpose |
|-------|---------|---------|
| `BoxUI` | `<ui-box>` | Padded container with shadow and border |
| `SurfaceUI` | `<ui-surface>` | Elevated background panel |
| `ColumnUI` | `<ui-column>` | Vertical flex layout |
| `RowUI` | `<ui-row>` | Horizontal flex layout |
| `StackUI` | `<ui-stack>` | Stacked/overlapping layout |
| `RectangleUI` | `<ui-rectangle>` | Boundary box (border) around children |

### Behavior (Composite)

| Class | Element | Purpose |
|-------|---------|---------|
| `ClickableUI` | `<ui-clickable>` | Adds click handling, emits `ui-click` |
| `HoverableUI` | `<ui-hoverable>` | Adds hover visual feedback |
| `FocusableUI` | `<ui-focusable>` | Adds focus management |
| `ToggleableUI` | `<ui-toggleable>` | Adds toggle state, emits `ui-change` |
| `ValidatableUI` | `<ui-validatable>` | Adds validation support |

### Leaf (terminal nodes)

| Class | Element | Purpose |
|-------|---------|---------|
| `LabelUI` | `<ui-label>` | Text label |
| `InputTextUI` | `<ui-input-text>` | Text input field |
| `InputNumberUI` | `<ui-input-number>` | Number input field |
| `InputSelectUI` | `<ui-input-select>` | Dropdown select |
| `InputCheckboxUI` | `<ui-input-checkbox>` | Checkbox |
| `SpacerUI` | `<ui-spacer>` | Vertical space (configurable height) |
| `DividerUI` | `<ui-divider>` | Horizontal or vertical line |
| `ErrorMessageUI` | `<ui-error>` | Error message text |

---

## Step-by-Step: Building an Application

### 1. Project Setup

Create a Vite + Lit application that depends on `@monorepo/core-design-composite`.

**package.json:**
```json
{
  "name": "@monorepo/composistion-demo-02",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "lit": "^3.3.1",
    "@monorepo/core-design-composite": "workspace:*"
  },
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^7.3.1"
  }
}
```

**tsconfig.json** (required settings for Lit 3 decorators):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### 2. Entry Point

**index.html:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Composite Demo</title>
    <link rel="stylesheet" href="/src/index.css" />
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**src/main.ts:**
```typescript
import "./demo-app.js";

const host = document.getElementById("app");
if (!host) throw new Error("Missing #app element");

host.appendChild(document.createElement("ui-demo-app"));
```

### 3. Build the Composite Tree

This is the core of the pattern. You declare your UI as an immutable tree of components.

**src/demo-app.ts:**
```typescript
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

// Side-effect import: registers all <ui-*> web components
import "@monorepo/core-design-composite";

import type { Component } from "@monorepo/core-design-composite";
import {
  BoxUI, SurfaceUI, ColumnUI, LabelUI, SpacerUI,
  InputNumberUI, ClickableUI, HoverableUI, RectangleUI,
} from "@monorepo/core-design-composite";
```

### 4. Declare the UI Tree

The tree is built using `.add()` calls. Each `.add()` returns a new immutable instance,
enabling fluent chaining:

```typescript
readonly #ui: Component = new BoxUI("DemoRoot").add(
  new SurfaceUI("FormSurface").add(
    new ColumnUI("FormColumn")
      .add(
        new RectangleUI("InputSection")
          .add(new LabelUI("Enter a number"))
          .add(new InputNumberUI("0"))
      )
      .add(new SpacerUI(12))
      .add(
        new RectangleUI("ButtonSection").add(
          new ClickableUI(new HoverableUI(new LabelUI("Submit")))
        )
      )
      .add(new SpacerUI(12))
      .add(
        new RectangleUI("OutputSection").add(
          new LabelUI("Result will appear here")
        )
      )
  )
);
```

This produces the following tree structure:

```
BoxUI("DemoRoot")
  └── SurfaceUI("FormSurface")
        └── ColumnUI("FormColumn")
              ├── RectangleUI("InputSection")
              │     ├── LabelUI("Enter a number")
              │     └── InputNumberUI("0")
              ├── SpacerUI(12)
              ├── RectangleUI("ButtonSection")
              │     └── ClickableUI
              │           └── HoverableUI
              │                 └── LabelUI("Submit")
              ├── SpacerUI(12)
              └── RectangleUI("OutputSection")
                    └── LabelUI("Result will appear here")
```

### 5. Render the Tree into the DOM

Use `firstUpdated()` to build the DOM once, into a placeholder `<div>`:

```typescript
protected firstUpdated(): void {
  const root = this.renderRoot.querySelector("#root");
  if (!root) throw new Error("Missing #root");
  root.replaceChildren(this.#ui.createElement());
}

protected render() {
  return html`<div id="root"></div>`;
}
```

**Why `firstUpdated()` instead of `render()`?**

Lit's `render()` method returns a Lit template (`html\`...\``). Inserting raw DOM nodes
into a Lit template (`html\`${domNode}\``) causes duplication and unstable reconciliation.
By appending the generated tree once in `firstUpdated()`, we avoid this entirely.

### 6. Wire Up Behavior

The composite tree is structural only. Interactive behavior (event handling, reading
values, updating the DOM) is wired imperatively after the tree is rendered:

```typescript
protected firstUpdated(): void {
  const root = this.renderRoot.querySelector("#root");
  if (!root) throw new Error("Missing #root");
  root.replaceChildren(this.#ui.createElement());

  // Wire up submit: read number input value and display it
  const clickable = root.querySelector("ui-clickable");
  const numberInput = root.querySelector("ui-input-number");
  const outputRects = root.querySelectorAll("ui-rectangle");
  const outputLabel = outputRects[2]?.querySelector("ui-label");

  if (clickable && numberInput && outputLabel) {
    clickable.addEventListener("ui-click", () => {
      const value = (numberInput as HTMLElement & { value: number | null }).value;
      outputLabel.textContent = value !== null
        ? `Submitted: ${value}`
        : "No value entered";
    });
  }
}
```

---

## How Slot-Based Composition Works

When `createElement()` is called on the root, this happens recursively:

```
1.  BoxUI.createElement()
      -> creates <ui-box>
      -> calls SurfaceUI.createElement()
           -> creates <ui-surface>
           -> calls ColumnUI.createElement()
                -> creates <ui-column>
                -> calls RectangleUI.createElement()
                     -> creates <ui-rectangle>
                     -> appends <ui-label> (from LabelUI)
                     -> appends <ui-input-number> (from InputNumberUI)
                -> appends <ui-rectangle> into <ui-column>
                -> ...continues for all children
           -> appends <ui-column> into <ui-surface>
      -> appends <ui-surface> into <ui-box>
```

The resulting DOM looks like:

```html
<ui-box>
  <ui-surface>
    <ui-column>
      <ui-rectangle>
        <ui-label>Enter a number</ui-label>
        <ui-input-number placeholder="0"></ui-input-number>
      </ui-rectangle>
      <ui-spacer size="12"></ui-spacer>
      <ui-rectangle>
        <ui-clickable>
          <ui-hoverable>
            <ui-label>Submit</ui-label>
          </ui-hoverable>
        </ui-clickable>
      </ui-rectangle>
      <ui-spacer size="12"></ui-spacer>
      <ui-rectangle>
        <ui-label>Result will appear here</ui-label>
      </ui-rectangle>
    </ui-column>
  </ui-surface>
</ui-box>
```

Each `<ui-*>` element is a Lit web component with a shadow DOM containing `<slot></slot>`.
The light-DOM children (appended by `createElement()`) are projected through the slot
and rendered visually.

---

## Creating Custom Components

### Adding a new Composite (container)

Two files are needed: the composite class and the web component.

**1. Composite class** (`layout/rectangle.ts`):
```typescript
import { Composite } from '../core/composite.js';

export class RectangleUI extends Composite {
  protected createHostElement(): HTMLElement {
    return document.createElement('ui-rectangle');
  }
}
```

**2. Web component** (`web-components/ui-rectangle.ts`):
```typescript
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-rectangle')
export class UIRectangleElement extends UIElement {
  static styles = css`
    :host { display: block; }
    .boundary {
      border: 2px solid var(--ui-border-rect, #333);
      border-radius: 4px;
      padding: 12px;
    }
  `;

  render() {
    return html`
      <div class="boundary">
        <slot></slot>
      </div>
    `;
  }
}
```

**3. Export both** from `index.ts`:
```typescript
export * from './layout/rectangle.js';
export * from './web-components/ui-rectangle.js';
```

### Adding a new Leaf (terminal node)

**1. Leaf class** (`input/label.ts`):
```typescript
import { Leaf } from '../core/leaf.js';

export class LabelUI extends Leaf {
  constructor(text: string) {
    super(text);
  }

  createElement(): HTMLElement {
    const el = document.createElement('ui-label');
    el.textContent = this.name;
    return el;
  }
}
```

**2. Web component** (`web-components/ui-label.ts`):
```typescript
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-label')
export class UILabelElement extends UIElement {
  static styles = css`
    :host { display: block; font-size: 14px; font-weight: 600; }
  `;

  render() {
    return html`<label><slot></slot></label>`;
  }
}
```

### Adding a new Behavior (decorator/wrapper)

Behavior composites wrap a single child and add interactivity:

**1. Behavior class** (`behavior/clickable.ts`):
```typescript
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ClickableUI extends Composite {
    constructor(child: Component) { super('Clickable', [child]); }
    protected createHostElement(): HTMLElement {
      return document.createElement('ui-clickable');
    }
}
```

**2. Web component** (`web-components/ui-clickable.ts`):
```typescript
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-clickable')
export class UIClickableElement extends UIElement {
  static styles = css`
    :host { display: block; cursor: pointer; }
  `;

  render() {
    return html`
      <div @click=${this.handleClick}>
        <slot></slot>
      </div>
    `;
  }

  private handleClick = (e: MouseEvent) => {
    this.dispatchEvent(new CustomEvent('ui-click', {
      detail: e, bubbles: true, composed: true
    }));
  };
}
```

---

## Lit 3 Requirements

### The `accessor` keyword

All `@property()` fields in web components **must** use the `accessor` keyword to avoid
class-field shadowing errors:

```typescript
// Correct
@property({ type: String }) accessor value = '';

// Wrong - will throw at runtime
@property({ type: String }) value = '';
```

### Side-effect import

The application must import `@monorepo/core-design-composite` as a **side-effect** to
ensure all `<ui-*>` custom elements are registered before use:

```typescript
import "@monorepo/core-design-composite";
```

### Type-only imports

With `verbatimModuleSyntax: true`, type imports must be explicit:

```typescript
import type { Component } from "@monorepo/core-design-composite";
```

---

## Build and Run

```bash
# Build the library first
pnpm -F @monorepo/core-design-composite build

# Then build/run the application
pnpm -F @monorepo/composistion-demo-02 build
pnpm -F @monorepo/composistion-demo-02 dev
```
