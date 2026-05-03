import { customElement } from "lit/decorators.js";

import { MonacoBuildProductViewBase } from "@monorepo/core-lit-monaco-build-product-abstract";

@customElement("build-result-view")
export class BuildResultView extends MonacoBuildProductViewBase {}

declare global {
  interface HTMLElementTagNameMap {
    "build-result-view": BuildResultView;
  }
}
