# ============================================
# UI FRAMEWORK GENERATOR (Lit 3 + Shadow DOM)
# ============================================

$root = "ui-framework"

# Clean existing framework
if (Test-Path $root) { Remove-Item $root -Recurse -Force }

# Create folder structure
$folders = @(
    "$root/core",
    "$root/layout",
    "$root/input",
    "$root/behavior",
    "$root/web-components",
    "$root/styles",
    "$root/demo",
    "$root/diagrams"
)

foreach ($f in $folders) {
    New-Item -ItemType Directory -Force -Path $f | Out-Null
}

# --------------------------------------------
# Function: Write-CodeFile
# --------------------------------------------
function Write-CodeFile($path, $content) {
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "✓ $path"
}

# ============================================
# BLOCK 1 — CORE
# ============================================

Write-CodeFile "$root/core/component.ts" @"
export interface Component {
    readonly name: string;
    readonly children: ReadonlyArray<Component>;
    createElement(): HTMLElement;
}
"@

Write-CodeFile "$root/core/leaf.ts" @"
import { Component } from "./component.js";

export class Leaf implements Component {
    constructor(public readonly name: string) {}

    get children(): ReadonlyArray<Component> {
        return [];
    }

    createElement(): HTMLElement {
        throw new Error(\`Leaf '\${this.name}' has no WebComponent.\`);
    }
}
"@

Write-CodeFile "$root/core/composite.ts" @"
import { Component } from "./component.js";

export abstract class Composite implements Component {
    constructor(
        public readonly name: string,
        private readonly nodes: ReadonlyArray<Component> = []
    ) {}

    get children(): ReadonlyArray<Component> {
        return this.nodes;
    }

    add(child: Component): this {
        return new (this.constructor as any)(
            this.name,
            [...this.nodes, child]
        );
    }

    abstract createElement(): HTMLElement;
}
"@

Write-CodeFile "$root/core/ui-element.ts" @"
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Component } from './component.js';

export abstract class UIElement<T extends Component = Component> extends LitElement {
    @property({ attribute: false }) model!: T;

    renderChildren() {
        return this.model.children.map(c => {
            const el = c.createElement();
            (el as any).model = c;
            return el;
        });
    }
}
"@
# ============================================
# BLOCK 2 — LAYOUT PRIMITIVES
# ============================================

Write-CodeFile "$root/layout/box.ts" @"
import { Composite } from '../core/composite.js';

export class BoxUI extends Composite {
    createElement(): HTMLElement { return document.createElement('ui-box'); }
}
"@

Write-CodeFile "$root/layout/row.ts" @"
import { Composite } from '../core/composite.js';

export class RowUI extends Composite {
    createElement(): HTMLElement { return document.createElement('ui-row'); }
}
"@

Write-CodeFile "$root/layout/column.ts" @"
import { Composite } from '../core/composite.js';

export class ColumnUI extends Composite {
    createElement(): HTMLElement { return document.createElement('ui-column'); }
}
"@

Write-CodeFile "$root/layout/stack.ts" @"
import { Composite } from '../core/composite.js';

export class StackUI extends Composite {
    createElement(): HTMLElement { return document.createElement('ui-stack'); }
}
"@

Write-CodeFile "$root/layout/surface.ts" @"
import { Composite } from '../core/composite.js';

export class SurfaceUI extends Composite {
    createElement(): HTMLElement { return document.createElement('ui-surface'); }
}
"@

Write-CodeFile "$root/layout/spacer.ts" @"
import { Leaf } from '../core/leaf.js';

export class SpacerUI extends Leaf {
    constructor(public size: number = 8) { super(\`Spacer(\${size})\`); }
    createElement(): HTMLElement {
        const el = document.createElement('ui-spacer');
        el.setAttribute('size', this.size);
        return el;
    }
}
"@

Write-CodeFile "$root/layout/divider.ts" @"
import { Leaf } from '../core/leaf.js';

export class DividerUI extends Leaf {
    constructor(public direction: 'horizontal' | 'vertical' = 'horizontal') { 
        super(\`Divider(\${direction})\`); 
    }
    createElement(): HTMLElement {
        const el = document.createElement('ui-divider');
        el.setAttribute('direction', this.direction);
        return el;
    }
}
"@

# ============================================
# BLOCK 3 — INPUT PRIMITIVES
# ============================================

Write-CodeFile "$root/input/label.ts" @"
import { Leaf } from '../core/leaf.js';

export class LabelUI extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement('ui-label');
        el.setAttribute('text', this.name);
        return el;
    }
}
"@

Write-CodeFile "$root/input/input-text.ts" @"
import { Composite } from '../core/composite.js';

export class InputTextUI extends Composite {
    constructor(public placeholder: string = '') { super(\`InputText(\${placeholder})\`); }
    createElement(): HTMLElement {
        const el = document.createElement('ui-input-text');
        el.setAttribute('placeholder', this.placeholder);
        return el;
    }
}
"@

Write-CodeFile "$root/input/input-number.ts" @"
import { Composite } from '../core/composite.js';

export class InputNumberUI extends Composite {
    constructor(public placeholder: string = '') { super(\`InputNumber(\${placeholder})\`); }
    createElement(): HTMLElement {
        const el = document.createElement('ui-input-number');
        el.setAttribute('placeholder', this.placeholder);
        return el;
    }
}
"@

Write-CodeFile "$root/input/input-checkbox.ts" @"
import { Leaf } from '../core/leaf.js';

export class InputCheckboxUI extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement('ui-input-checkbox');
        el.setAttribute('label', this.name);
        return el;
    }
}
"@

Write-CodeFile "$root/input/input-select.ts" @"
import { Composite } from '../core/composite.js';

export class InputSelectUI extends Composite {
    constructor(public options: string[]) { super('InputSelect'); }
    createElement(): HTMLElement {
        const el = document.createElement('ui-input-select');
        el.setAttribute('options', JSON.stringify(this.options));
        return el;
    }
}
"@

Write-CodeFile "$root/input/error.ts" @"
import { Leaf } from '../core/leaf.js';

export class ErrorMessageUI extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement('ui-error');
        el.setAttribute('message', this.name);
        return el;
    }
}
"@

# ============================================
# BLOCK 4 — BEHAVIOR PRIMITIVES
# ============================================

Write-CodeFile "$root/behavior/clickable.ts" @"
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ClickableUI extends Composite {
    constructor(child: Component) { super('Clickable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-clickable'); }
}
"@

Write-CodeFile "$root/behavior/hoverable.ts" @"
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class HoverableUI extends Composite {
    constructor(child: Component) { super('Hoverable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-hoverable'); }
}
"@

Write-CodeFile "$root/behavior/focusable.ts" @"
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class FocusableUI extends Composite {
    constructor(child: Component) { super('Focusable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-focusable'); }
}
"@

Write-CodeFile "$root/behavior/toggleable.ts" @"
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ToggleableUI extends Composite {
    constructor(child: Component, public defaultState: boolean = false) { 
        super('Toggleable', [child]); 
    }
    createElement(): HTMLElement {
        const el = document.createElement('ui-toggleable');
        el.setAttribute('state', this.defaultState);
        return el;
    }
}
"@

Write-CodeFile "$root/behavior/validatable.ts" @"
import { Composite } from '../core/composite.js';
import type { Component } from '../core/component.js';

export class ValidatableUI extends Composite {
    constructor(child: Component) { super('Validatable', [child]); }
    createElement(): HTMLElement { return document.createElement('ui-validatable'); }
}
"@
# ============================================
# BLOCK 5 — LAYOUT WEB COMPONENTS
# ============================================

Write-CodeFile "$root/web-components/ui-box.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-box')
export class UIBoxElement extends UIElement {
    static styles = css\`
        :host {
            display: block;
            padding: 16px;
            border-radius: 8px;
            background: var(--ui-bg-surface, #fff);
            box-shadow: var(--ui-shadow-1, 0 1px 3px rgba(0,0,0,0.1));
            border: 1px solid var(--ui-border-light, #ddd);
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-row.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-row')
export class UIRowElement extends UIElement {
    static styles = css\`
        :host {
            display: flex;
            flex-direction: row;
            gap: var(--ui-space-2, 8px);
            align-items: center;
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-column.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-column')
export class UIColumnElement extends UIElement {
    static styles = css\`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--ui-space-2, 8px);
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-stack.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-stack')
export class UIStackElement extends UIElement {
    static styles = css\`
        :host {
            display: grid;
            position: relative;
        }
        ::slotted(*) {
            grid-area: 1 / 1;
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-surface.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-surface')
export class UISurfaceElement extends UIElement {
    static styles = css\`
        :host {
            display: block;
            padding: 20px;
            background: var(--ui-bg-elevated, #fcfcfc);
            border-radius: var(--ui-radius-md, 8px);
            box-shadow: var(--ui-shadow-2, 0 3px 8px rgba(0,0,0,0.12));
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-spacer.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-spacer')
export class UISpacerElement extends UIElement {
    @property({ type: Number }) size = 8;

    static styles = css\`
        :host {
            display: block;
            width: 100%;
        }
    \`;

    render() {
        return html\`<div style=\"height: \${this.size}px;\"></div>\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-divider.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-divider')
export class UIDividerElement extends UIElement {
    @property({ type: String }) direction: 'horizontal' | 'vertical' = 'horizontal';

    static styles = css\`
        :host {
            display: block;
            margin: 4px 0;
        }
        .horizontal {
            height: 1px;
            width: 100%;
            background: var(--ui-border-light, #ddd);
        }
        .vertical {
            width: 1px;
            height: 100%;
            background: var(--ui-border-light, #ddd);
        }
    \`;

    render() {
        return html\`
            <div class=\"\${this.direction}\"></div>
        \`;
    }
}
"@
# ============================================
# BLOCK 6 — INPUT WEB COMPONENTS
# ============================================

Write-CodeFile "$root/web-components/ui-label.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-label')
export class UILabelElement extends UIElement {
    static styles = css\`
        :host {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }
    \`;

    render() {
        return html\`<label>\${this.model.name}</label>\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-input-text.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-text')
export class UIInputTextElement extends UIElement {
    @property() placeholder = '';

    static styles = css\`
        :host { display: block; }
        input {
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #aaa;
            font-size: 14px;
        }
    \`;

    render() {
        return html\`
            <input type=\"text\" placeholder=\"\${this.placeholder}\" />
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-input-number.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-number')
export class UIInputNumberElement extends UIElement {
    @property() placeholder = '';

    static styles = css\`
        :host { display: block; }
        input {
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #aaa;
            font-size: 14px;
        }
    \`;

    render() {
        return html\`
            <input type=\"number\" placeholder=\"\${this.placeholder}\" />
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-input-checkbox.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-checkbox')
export class UIInputCheckboxElement extends UIElement {
    @property() label = '';

    static styles = css\`
        :host { display: block; }
        label {
            display: flex;
            gap: 8px;
            align-items: center;
        }
    \`;

    render() {
        return html\`
            <label>
                <input type=\"checkbox\" />
                <span>\${this.label}</span>
            </label>
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-input-select.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-input-select')
export class UIInputSelectElement extends UIElement {
    @property({ type: Array }) options: string[] = [];

    static styles = css\`
        :host { display: block; }
        select {
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #aaa;
        }
    \`;

    render() {
        const renderOption = (o: string) => html\`<option>\`$\{o}\</option>\`;

        return html\`
            <select>
                \${this.options.map(renderOption)}
            </select>
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-error.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-error')
export class UIErrorElement extends UIElement {
    @property() message = '';

    static styles = css\`
        :host {
            display: block;
            padding: 8px;
            border-radius: 4px;
            background: #ffe0e0;
            color: #a00000;
            font-size: 13px;
            margin-top: 8px;
        }
    \`;

    render() {
        return html\`\${this.message}\`;
    }
}
"@
# ============================================
# BLOCK 7 — BEHAVIOR WEB COMPONENTS
# ============================================

Write-CodeFile "$root/web-components/ui-clickable.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-clickable')
export class UIClickableElement extends UIElement {
    static styles = css\`
        :host { display: block; cursor: pointer; }
        :host(:hover) { opacity: 0.9; }
    \`;

    render() {
        return html\`
            <div @click=\`\${() => this.dispatchEvent(new CustomEvent('ui-click'))}\`>
                \${this.renderChildren()}
            </div>
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-hoverable.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-hoverable')
export class UIHoverableElement extends UIElement {
    static styles = css\`
        :host { display: block; }
        :host(:hover) { filter: brightness(1.1); }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-focusable.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-focusable')
export class UIFocusableElement extends UIElement {
    static styles = css\`
        :host { display: block; }
        :host(:focus-within) {
            outline: 2px solid var(--ui-primary, #007bff);
            border-radius: 6px;
        }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-toggleable.ts" @"
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-toggleable')
export class UIToggleableElement extends UIElement {
    @property({ type: Boolean }) state = false;

    static styles = css\`
        :host { display: block; cursor: pointer; }
        .active { background: var(--ui-primary, #007bff); color: white; padding: 4px; border-radius: 4px; }
    \`;

    render() {
        return html\`
            <div class=\\"\${this.state ? 'active' : ''}\\" 
                 @click=\`\${() => this.state = !this.state}\`>
                \${this.renderChildren()}
            </div>
        \`;
    }
}
"@

Write-CodeFile "$root/web-components/ui-validatable.ts" @"
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UIElement } from '../core/ui-element.js';

@customElement('ui-validatable')
export class UIValidatableElement extends UIElement {
    static styles = css\`
        :host { display: block; }
    \`;

    render() {
        return html\`\${this.renderChildren()}\`;
    }
}
"@

# ============================================
# BLOCK 8 — GLOBAL STYLESHEET
# ============================================

Write-CodeFile "$root/styles/style.css" @"
:root {
    --ui-bg-surface: #ffffff;
    --ui-bg-elevated: #f7f7f7;

    --ui-text-1: #222;
    --ui-text-2: #555;

    --ui-primary: #0d6efd;

    --ui-border-light: #dddddd;
    --ui-border-strong: #aaaaaa;

    --ui-radius-sm: 4px;
    --ui-radius-md: 8px;
    --ui-radius-lg: 12px;

    --ui-space-1: 4px;
    --ui-space-2: 8px;
    --ui-space-3: 12px;
    --ui-space-4: 16px;
}
"# ============================================
# BLOCK 9 — DEMO APP (index.html, main.ts, demo-ui.ts)
# ============================================

Write-CodeFile "$root/demo/index.html" @"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <title>UI Framework Demo</title>
    <link rel='stylesheet' href='../styles/style.css'>
</head>
<body>
    <div id='app'></div>
    <script type='module' src='./main.ts'></script>
</body>
</html>
"@

Write-CodeFile "$root/demo/main.ts" @"
import { createDemoUI } from './demo-ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('app');
    if (!root) throw new Error('Missing #app element');

    const ui = createDemoUI();
    const el = ui.createElement();
    (el as any).model = ui;

    root.appendChild(el);
});
"@

Write-CodeFile "$root/demo/demo-ui.ts" @"
import { BoxUI } from '../layout/box.js';
import { ColumnUI } from '../layout/column.js';
import { SpacerUI } from '../layout/spacer.js';
import { DividerUI } from '../layout/divider.js';
import { SurfaceUI } from '../layout/surface.js';

import { LabelUI } from '../input/label.js';
import { InputTextUI } from '../input/input-text.js';
import { InputNumberUI } from '../input/input-number.js';
import { InputSelectUI } from '../input/input-select.js';
import { ErrorMessageUI } from '../input/error.js';

import { ClickableUI } from '../behavior/clickable.js';
import { HoverableUI } from '../behavior/hoverable.js';

export function createDemoUI() {
    return new BoxUI('DemoRoot')
        .add(
            new SurfaceUI('Form')
                .add(
                    new ColumnUI('FormColumn')
                        .add(new LabelUI('Name'))
                        .add(new InputTextUI('Your name'))
                        .add(new SpacerUI(12))

                        .add(new LabelUI('Age'))
                        .add(new InputNumberUI('0'))
                        .add(new SpacerUI(12))

                        .add(new LabelUI('Favorite Color'))
                        .add(new InputSelectUI(['Red', 'Green', 'Blue']))
                        .add(new SpacerUI(12))

                        .add(new ClickableUI(new HoverableUI(new LabelUI('Submit'))))
                        .add(new SpacerUI(8))
                        .add(new DividerUI())
                        .add(new ErrorMessageUI('Example error message'))
                )
        );
}
"@

# ============================================
# BLOCK 10 — README
# ============================================

Write-CodeFile "$root/README.md" @"
# UI Framework — Composite + Lit 3 + Shadow DOM

This project demonstrates a fully SOLID, DRY, Open/Closed UI architecture
based on:

- Composite Pattern (OOP)
- Runtime rendering with Web Components
- Lit 3 with Shadow DOM
- Behavior Wrappers
- Layout Primitives
- Input Primitives

## Running

Serve the demo folder using any static server:

\`\`\`
cd ui-framework/demo
npx serve .
\`\`\`

Open:

\`\`\`
http://localhost:3000
\`\`\`

## Architecture

- UI Element Tree is built from pure TypeScript models
- Web Components render the tree
- Input, layout, and behavior primitives compose arbitrarily
- Token-based design system in \`styles/style.css\`

See diagram in \`diagrams/classes.puml\`.
"@

# ============================================
# BLOCK 11 — PUML CLASS DIAGRAM
# ============================================

Write-CodeFile "$root/diagrams/classes.puml" @"
@startuml
title UI Framework – Architecture Overview

package Core {
    interface Component
    abstract class Composite
    class Leaf
    abstract class UIElement
}

Component <|-down- Composite
Component <|-down- Leaf
UIElement <|-down- UIBoxElement

package Layout {
    class BoxUI
    class RowUI
    class ColumnUI
    class StackUI
    class SurfaceUI
    class SpacerUI
    class DividerUI
}

Composite <|-down- BoxUI
Composite <|-down- RowUI
Composite <|-down- ColumnUI
Composite <|-down- StackUI
Composite <|-down- SurfaceUI
Leaf <|-down- SpacerUI
Leaf <|-down- DividerUI

package Input {
    class LabelUI
    class InputTextUI
    class InputNumberUI
    class InputCheckboxUI
    class InputSelectUI
    class ErrorMessageUI
}

Leaf <|-down- LabelUI
Composite <|-down- InputTextUI
Composite <|-down- InputNumberUI
Leaf <|-down- InputCheckboxUI
Composite <|-down- InputSelectUI
Leaf <|-down- ErrorMessageUI

@enduml
"@

# ============================================
# FOOTER — SUCCESS MESSAGE
# ============================================

Write-Host ""
Write-Host "============================================"
Write-Host " UI Framework Generated Successfully!"
Write-Host " Location: $root"
Write-Host "============================================"
Write-Host ""
Write-Host "Run demo:"
Write-Host "  cd ui-framework/demo"
Write-Host "  npx serve ."
Write-Host ""
