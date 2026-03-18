````md
# @monorepo/core-style-system

A lightweight, domain-agnostic style system for resolving composable styles using tokens and overrides.

This package provides a clean, extensible mechanism to define, compose, and resolve styles for any domain:

- Graphics (SVG, Canvas, WebGL)
- UI components (Lit, React, HTML)
- Data visualization
- Game objects
- Any domain model requiring styling

The module has **no dependency on DOM or domain models**.

---

## Features

- Token-based styling
- Inheritance between style tokens
- Override support
- Multiple style libraries with precedence
- Fully immutable style output
- Domain-agnostic design
- Open/Closed compliant

---

## Installation

```bash
pnpm add @monorepo/core-style-system
````

---

## Core Concepts

### IStyle

Represents the fully resolved style.

```ts
interface IStyle {
  stroke?: {
    color?: string;
    width?: number;
    dash?: readonly number[];
  };
  fill?: {
    color?: string;
  };
  opacity?: number;
}
```

---

### IStyleReference

Describes how a style should be resolved.

```ts
interface IStyleReference {
  token?: string;
  overrides?: IStyle;
}
```

* `token`: reference to a named style
* `overrides`: local modifications applied after resolution

---

### IStyleToken

Defines a reusable named style.

```ts
interface IStyleToken {
  name: string;
  extends?: readonly string[];
  style: IStyle;
}
```

Supports inheritance through `extends`.

---

### IStyleLibrary

Container for tokens.

```ts
interface IStyleLibrary {
  tokens: Readonly<Record<string, IStyleToken>>;
}
```

---

### StyleResolver

Resolves a style reference into a final style.

```ts
const style = resolver.resolve(reference);
```

Resolution pipeline:

```
token → inheritance → merge → overrides → final style
```

---

## Basic Usage

### Define Tokens

```ts
import type { IStyleToken } from "@monorepo/core-style-system";

export const TOKENS = {
  base: {
    name: "base",
    style: {
      stroke: { color: "transparent", width: 1 },
      fill: { color: "transparent" },
      opacity: 1,
    },
  },

  primary: {
    name: "primary",
    extends: ["base"],
    style: {
      stroke: { color: "#2563eb", width: 2 },
      fill: { color: "rgba(37,99,235,0.15)" },
    },
  },
} satisfies Record<string, IStyleToken>;
```

---

### Create Resolver

```ts
import {
  StyleLibrary,
  StyleResolver,
} from "@monorepo/core-style-system";

const resolver = new StyleResolver([
  new StyleLibrary(TOKENS),
]);
```

---

### Resolve Style

```ts
const style = resolver.resolve({
  token: "primary",
  overrides: {
    opacity: 0.5,
  },
});
```

---

## Using in Domain Models

The style system is not aware of your domain. You integrate it explicitly.

```ts
import type { IStyleReference } from "@monorepo/core-style-system";

export interface IEntity {
  id: string;
  style?: IStyleReference;
}
```

Usage:

```ts
const resolved = resolver.resolve(entity.style);
```

---

## Rendering Adapter Example (SVG)

```ts
import type { IStyle } from "@monorepo/core-style-system";

export interface ISvgStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  strokeDasharray: string;
  opacity: number;
}

export class SvgStyleAdapter {
  public adapt(style?: Readonly<IStyle>): ISvgStyle {
    return {
      stroke: style?.stroke?.color ?? "transparent",
      fill: style?.fill?.color ?? "transparent",
      strokeWidth: style?.stroke?.width ?? 1,
      strokeDasharray: (style?.stroke?.dash ?? []).join(" "),
      opacity: style?.opacity ?? 1,
    };
  }
}
```

---

## Token Inheritance

```ts
const TOKENS = {
  base: {
    name: "base",
    style: { opacity: 1 },
  },

  warning: {
    name: "warning",
    extends: ["base"],
    style: {
      fill: { color: "orange" },
    },
  },

  warningBold: {
    name: "warningBold",
    extends: ["warning"],
    style: {
      stroke: { width: 3 },
    },
  },
};
```

---

## Multiple Libraries

```ts
const resolver = new StyleResolver([
  new StyleLibrary(defaultTokens),
  new StyleLibrary(themeTokens),
]);
```

Resolution order:

* Last library wins
* Later libraries override earlier ones

---

## Override Behavior

```ts
resolver.resolve({
  token: "primary",
  overrides: {
    stroke: { width: 5 },
  },
});
```

Rules:

* Overrides always win
* Partial overrides are merged
* Undefined values are ignored

---

## Error Handling

The resolver throws on:

* Unknown token
* Circular inheritance

Example:

```ts
try {
  resolver.resolve({ token: "missing" });
} catch (error) {
  // handle error
}
```

---

## Design Guidelines

### Keep the Style System Pure

Do not introduce:

* DOM types (`HTMLElement`, `Element`)
* Domain models (`Shape`, `Component`, etc.)

---

### Use Adapters for Rendering

Convert `IStyle` into:

* SVG attributes
* Canvas instructions
* CSS styles
* WebGL uniforms

---

### Keep Domain Separate

Domain objects should only reference:

```ts
style?: IStyleReference;
```

---

### Extend via Tokens

Add new styles by adding tokens, not modifying code.

---

## Recommended Architecture

```
core-style-system
 ├── contracts (IStyle, tokens)
 ├── resolver
 └── library

domain (e.g. shapes, ui, game)
 └── uses IStyleReference

rendering layer
 ├── adapters (IStyle → render format)
 └── rendering logic
```

---

## Summary

* The style system is independent of any domain
* Styling is declarative via tokens and overrides
* Resolution is deterministic and composable
* Rendering is handled outside the system

This enables reuse across multiple applications and rendering technologies.

```
```
