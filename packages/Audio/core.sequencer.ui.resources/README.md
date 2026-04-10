# @monorepo/core.sequencer.ui.resources

SVG-based UI component resources for music sequencer interfaces. Includes generators for buttons, labels, knobs, and tone scales with full Lit 3 web component support.

## Overview

This package provides a comprehensive set of reusable SVG generators and Lit web components for building music sequencer user interfaces:

- **Digit buttons** (0–9) with on/off state
- **RGB color buttons** (no-text variants)
- **Knob buttons** (matte, glossy, ribbed, beveled variants)
- **Tone scale labels** (C through B with CSS-like margins)
- **Complete Lit wrappers** for all SVG generators

All styling flows through **`@monorepo/core-style-system`**, which is the canonical, unified approach for the entire monorepo.

---

## Styling via @monorepo/core-style-system

**Do not define inline styles in this package.** All visual properties must be managed through the core style system.

### Why

- **Consistency** — All sequencer UI components share tokens
- **Maintainability** — Change a color once, update everywhere
- **Reusability** — Tokens work across all rendering targets
- **Decoupling** — Styling is independent of component logic

### How

Each generator function accepts a `style?` parameter that overrides default tokens:

```ts
import { SemanticShapesComposition } from '@monorepo/core-semantic-model-shapes';
import { createDigitButtonSvg } from '@monorepo/core.sequencer.ui.resources';

const rectangleFactory = new SemanticShapesComposition().rectangleFactory;

const button = createDigitButtonSvg({
  shape: rectangleFactory.create({
    id: 'digit-1',
    x: 0,
    y: 0,
    width: 88,
    height: 88,
  }),
  id: 'digit-1',
  x: 0,
  y: 0,
  width: 88,
  height: 88,
  digit: 1,
  style: {
    fill: '#12161f',
    textColor: '#f1efe6',
    // ... other style properties
  },
});
```

Defaults are sourced from `@monorepo/core-style-system`:

```ts
import { resolveTokenStyle, getDesignSystemFontFamily } from './styleSystem';

// Token resolution
const surfaceStyle = resolveTokenStyle({ token: 'surface' });

// Design system font
const fontFamily = getDesignSystemFontFamily();
```

### No Alternative Styling

- ❌ Hard-coded hex colors in component logic
- ❌ Ad-hoc color objects or stroke definitions
- ❌ Inline style computation bypassing tokens
- ✅ Token-driven defaults with override support

---

## Installation

```bash
pnpm add @monorepo/core.sequencer.ui.resources
```

---

## SVG Generators

### Digital Buttons

```ts
import { SemanticShapesComposition } from '@monorepo/core-semantic-model-shapes';
import { createDigitButtonSvg, createDigitButtonsSvg } from '@monorepo/core.sequencer.ui.resources';

const rectangleFactory = new SemanticShapesComposition().rectangleFactory;

// Single digit
const resource = createDigitButtonSvg({
  shape: rectangleFactory.create({
    id: 'btn-digit-5',
    x: 0,
    y: 0,
    width: 88,
    height: 88,
  }),
  id: 'btn-digit-5',
  x: 0,
  y: 0,
  width: 88,
  height: 88,
  digit: 5,
  on: true,
});

console.log(resource.svg);  // SVG string

// 0–9 batch
const all = createDigitButtonsSvg({
  shapeFactory: rectangleFactory,
  idPrefix: 'digit',
  startX: 0,
  startY: 0,
  buttonWidth: 88,
  buttonHeight: 88,
  gap: 8,
  onDigit: 5,
});
```

### RGB Buttons

```ts
import { createRgbButtonSvg } from '@monorepo/core.sequencer.ui.resources';

const button = createRgbButtonSvg({
  id: 'btn-rgb-red',
  x: 0,
  y: 0,
  buttonWidth: 40,
  buttonHeight: 40,
  red: 255,
  green: 40,
  blue: 40,
  onState: true,
});
```

### Knob Buttons

```ts
import { createKnobButtonSvg } from '@monorepo/core.sequencer.ui.resources';

const knob = createKnobButtonSvg({
  id: 'btn-knob-1',
  x: 0,
  y: 0,
  buttonWidth: 88,
  buttonHeight: 88,
  variant: 'matte',  // 'matte' | 'glossy' | 'ribbed' | 'beveled'
  onState: true,
});
```

### Tone Labels

```ts
import { createToneLabelSvg, createToneScaleLabelsSvg } from '@monorepo/core.sequencer.ui.resources';

// Single label
const label = createToneLabelSvg({
  id: 'label-c-sharp',
  x: 0,
  y: 100,
  buttonWidth: 88,
  buttonHeight: 88,
  tone: 'C#',
  style: {
    margin: '12% 6%',  // CSS-like shorthand
  },
});

// Full scale (C through B)
const scale = createToneScaleLabelsSvg({
  idPrefix: 'tone',
  startX: 0,
  startY: 100,
  buttonWidth: 88,
  buttonHeight: 88,
  gap: 8,
});
```

---

## Lit Web Components

All SVG generators have corresponding Lit 3 custom elements:

### `<sequencer-digit-button>`

```html
<sequencer-digit-button digit="5" on></sequencer-digit-button>
```

Properties:
- `digit`: 0–9
- `on`: boolean (omit or set to false for off state)

Events:
- `digit-toggled`: fires when button is clicked

### `<sequencer-digit-button-row>`

```html
<sequencer-digit-button-row on-digit="5"></sequencer-digit-button-row>
```

Properties:
- `on-digit`: which digit (0–9) is active

### `<sequencer-rgb-button>`

```html
<sequencer-rgb-button r="255" g="40" b="40" on></sequencer-rgb-button>
```

### `<sequencer-knob-button>`

```html
<sequencer-knob-button variant="matte" on></sequencer-knob-button>
```

Variants: `matte` | `glossy` | `ribbed` | `beveled`

### `<sequencer-tone-label>` & `<sequencer-tone-label-row>`

```html
<sequencer-tone-label tone="C#" button-width="88" button-height="88"></sequencer-tone-label>
<sequencer-tone-label-row button-width="88" button-height="88"></sequencer-tone-label-row>
```

---

## Testing

```bash
pnpm test
```

Tests are BDD-style with DRY fixture builders covering:
- SVG output determinism
- Style application
- Margin parsing (CSS-like shorthand)
- Error handling

---

## Design Principles

1. **SVG-first** — All UI renders as immutable SVG strings
2. **Semantic backing** — Uses `@monorepo/core-semantic-model-shapes` for geometric foundation
3. **Token-driven** — Styling via `@monorepo/core-style-system`, never ad-hoc
4. **Immutable resources** — Generators return frozen objects
5. **Accessible** — Proper ARIA labels and role attributes
6. **Composable** — Generators can be combined for complex layouts

---

## See Also

- [`@monorepo/core-style-system`](../../core-style-system) — Central styling authority
- [`@monorepo/core-semantic-model-shapes`](../core-semantic-model-shapes) — Shape model foundation
