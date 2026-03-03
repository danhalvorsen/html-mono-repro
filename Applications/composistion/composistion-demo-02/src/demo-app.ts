// Applications/composistion/composistion-demo-02/src/demo-app.ts

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
  SpacerUI,
  InputNumberUI,
  ClickableUI,
  HoverableUI,
  RectangleUI,
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

  protected firstUpdated(): void {
    const root = this.renderRoot.querySelector("#root");
    if (!root) throw new Error("Missing #root");
    root.replaceChildren(this.#ui.createElement());

    // Wire up submit: read number input value and display it as text
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

  protected render() {
    return html`<div id="root"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-demo-app": UiDemoApp;
  }
}
