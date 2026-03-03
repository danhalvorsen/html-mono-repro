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
  RectangleUI,
  ButtonUI,
  RowUI,
} from "@monorepo/core-design-composite";

@customElement("ui-demo-app")
export class UiDemoApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 720px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
  `;

  readonly #ui: Component = new BoxUI("DemoRoot").add(
    new SurfaceUI("FormSurface").add(
      new ColumnUI("Calculator").add(
        new RectangleUI("InputSection")
          .add(new LabelUI("Enter a number"))
          .add(new SpacerUI(8))
          // Operations row
          .add(
            new RowUI("Ops")
              .add(new ButtonUI(new LabelUI("/")))
              .add(new ButtonUI(new LabelUI("*")))
              .add(new ButtonUI(new LabelUI("+")))
              .add(new ButtonUI(new LabelUI("-"))),
          )
          .add(new SpacerUI(4))
          // Row: 7 8 9
          .add(
            new RowUI("Row1")
              .add(new ButtonUI(new LabelUI("7")))
              .add(new ButtonUI(new LabelUI("8")))
              .add(new ButtonUI(new LabelUI("9"))),
          )
          .add(new SpacerUI(4))
          // Row: 4 5 6
          .add(
            new RowUI("Row2")
              .add(new ButtonUI(new LabelUI("4")))
              .add(new ButtonUI(new LabelUI("5")))
              .add(new ButtonUI(new LabelUI("6"))),
          )
          .add(new SpacerUI(4))
          // Row: 1 2 3
          .add(
            new RowUI("Row3")
              .add(new ButtonUI(new LabelUI("1")))
              .add(new ButtonUI(new LabelUI("2")))
              .add(new ButtonUI(new LabelUI("3"))),
          )
          .add(new SpacerUI(4))
          // Row: 0 Enter
          .add(
            new RowUI("Row4")
              .add(new ButtonUI(new LabelUI("0")))
              .add(new ButtonUI(new LabelUI("Enter"), "primary")),
          ),
      ),
    ),
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
        
        const value = (numberInput as HTMLElement & { value: number | null })
          .value;
        outputLabel.textContent =
          value !== null ? `Submitted: ${value}` : "No value entered";
      });
    }

    root.addEventListener("ui-click", (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || target.tagName !== "UI-BUTTON") return;
    const { label } = (e as CustomEvent).detail;
    console.log(label);
});

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
