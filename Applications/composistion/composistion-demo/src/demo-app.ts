// Applications/composistion/composistion-demo/src/demo-app.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

// Side-effect import that MUST register all ui-* web components.
import "@monorepo/core-design-composite";

// type-only import (required because verbatimModuleSyntax = true)
import type { Component } from "@monorepo/core-design-composite";

// value imports
import {
  BoxUI,
  SurfaceUI,
  ColumnUI,
  LabelUI,
  InputTextUI,
  SpacerUI,
  InputNumberUI,
  RowUI,
  InputSelectUI,
  ToggleableUI,
  DividerUI,
  ClickableUI,
  HoverableUI,
  ErrorMessageUI,
} from "@monorepo/core-design-composite";

@customElement("ui-demo-app")
export class UiDemoApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 720px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial,
        sans-serif;
    }
  `;

  readonly #ui: Component = new BoxUI("DemoRoot").add(
    new SurfaceUI("FormSurface").add(
      new ColumnUI("FormColumn")
        .add(new LabelUI("Name"))
        .add(new InputTextUI("Your name"))
        .add(new SpacerUI(12))
        .add(new LabelUI("Age"))
        .add(new InputNumberUI("0"))
        .add(new SpacerUI(12))
        .add(
          new RowUI("Row")
            .add(new LabelUI("Color"))
            .add(new InputSelectUI(["Red", "Green", "Blue"]))
        )
        .add(new SpacerUI(12))
        .add(new ToggleableUI(new LabelUI("Advanced"), true))
        .add(new SpacerUI(8))
        .add(new DividerUI())
        .add(new ClickableUI(new HoverableUI(new LabelUI("Submit"))))
        .add(new ErrorMessageUI("Example error message"))
    )
  );

  protected render() {
    const el = this.#ui.createElement();
    (el as unknown as { model: Component }).model = this.#ui;
    return html`${el}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-demo-app": UiDemoApp;
  }
}