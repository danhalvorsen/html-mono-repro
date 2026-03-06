// ============================================================================
// packages/NewShapeThreeJS/Application/core-vite-three-lit-sandbox/src/main.ts
// ============================================================================

import "./MyElement";

document.body.appendChild(document.createElement("my-element"));

// ============================================================================
// packages/NewShapeThreeJS/Application/core-vite-three-lit-sandbox/src/my-element.ts
// ============================================================================

import type { MyElement } from "./MyElement.js";

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}

