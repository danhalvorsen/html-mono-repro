import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { Calculator } from "./calculator/calculator.js";
import { CalculatorFsm } from "./calculator/calculator.fsm.js";

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
  InputNumberUI,
} from "@monorepo/core-design-composite";

// calculator domain
import type {
  CalculatorInput,
  Digit,
  Operator,
} from "./calculator/calculator.types.js";
import { InputType } from "./calculator/calculator.types.js";
 
import { CalculatorCqrs } from "./calculator/calculator.cqrs.js";
import type { CalculatorCommand, GetDisplayQry } from "./calculator/calculator.cqrs.messages.js";
import { CalculatorMessageName } from "./calculator/calculator.cqrs.names.js";

/* ============================= Calculator abstraction (minimal) ============================= */

/* ============================= Label -> Input mapping ============================= */

function isDigitLabel(x: string): x is Digit {
  return x.length === 1 && x >= "0" && x <= "9";
}
function isOperatorLabel(x: string): x is Operator {
  return x === "+" || x === "-" || x === "*" || x === "/";
}

function inputFromLabel(label: string): CalculatorInput | undefined {
  if (isDigitLabel(label)) {
    return { type: InputType.Digit, payload: { d: label } };
  }
  if (isOperatorLabel(label)) {
    return { type: InputType.Operator, payload: { op: label } };
  }
  if (label === "CR") {
    return { type: InputType.CR, payload: undefined };
  }
  if (label === "=" || label.includes("=")) {
    return { type: InputType.Equals, payload: undefined };
  }
  return undefined;
}

function commandFromInput(input: CalculatorInput): CalculatorCommand {
  if (input.type === InputType.Digit) {
    return {
      name: CalculatorMessageName.Digit,
      json: JSON.stringify({ digit: input.payload.d }),
    };
  }

  if (input.type === InputType.Operator) {
    return {
      name: CalculatorMessageName.Operator,
      json: JSON.stringify({ op: input.payload.op }),
    };
  }

  if (input.type === InputType.Equals) {
    return {
      name: CalculatorMessageName.Equal,
      json: JSON.stringify({}),
    };
  }

  if (input.type === InputType.CR) {
    return {
      name: CalculatorMessageName.Clear,
      json: JSON.stringify({}),
    };
  }

  return {
    name: CalculatorMessageName.Clear,
    json: JSON.stringify({}),
  };
}
 
/* ============================= UI ============================= */

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

  // TODO: inject real CalculatorService here (composition root / DI)
  #calculator?: CalculatorCqrs;
   readonly #ui: Component = new BoxUI("DemoRoot").add(
    new SurfaceUI("FormSurface").add(
      new ColumnUI("Calculator").add(
        new RectangleUI("InputSection")
          .add(new LabelUI("Calculator"))
          .add(new SpacerUI(4))
          .add(new InputNumberUI(""))
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
          // Row: 0 Equals
          .add(
            new RowUI("Row4")
              .add(new ButtonUI(new LabelUI("0")))
              .add(new ButtonUI(new LabelUI("CR")))
              .add(new ButtonUI(new LabelUI("="), "primary")),
          ),
      ),
    ),
  );

  protected async firstUpdated(): Promise<void> {
    const calculator = new Calculator(new CalculatorFsm().definition);
    this.#calculator = new CalculatorCqrs(calculator);

    const root = this.renderRoot.querySelector("#root");
    if (!root) throw new Error("Missing #root");
    root.replaceChildren(this.#ui.createElement());

    const displayInput = root.querySelector("ui-input-number") as
      | (HTMLElement & { value: number | null })
      | null;

    const syncDisplay = async (): Promise<void> => {
      if (!this.#calculator || !displayInput) return;

      const query: GetDisplayQry = {
        name: CalculatorMessageName.GetDisplay,
        json: JSON.stringify({}),
      };
      const result = await this.#calculator.query(query);
      if (!result.isOk()) return;

      const display = result.unwrap();
      if (display === "") {
        displayInput.value = null;
        return;
      }

      const asNumber = Number(display);
      displayInput.value = Number.isNaN(asNumber) ? null : asNumber;
    };

    await syncDisplay();

    root.addEventListener("ui-click", async (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLElement) || target.tagName !== "UI-BUTTON")
        return;

      const detail = (e as CustomEvent).detail as
        | { calculatorButton?: { label?: string } }
        | undefined;

      // Prefer model label; fallback to textContent if needed.
      const label =
        String(detail?.calculatorButton?.label ?? "").trim() ||
        String(target.textContent ?? "").trim();

      const input = inputFromLabel(label);
      if (!input) return;

      if (!this.#calculator) {
        console.warn("Calculator not wired. Ignoring input:", input);
        return;
      }

      const command = commandFromInput(input);
      console.info("[ui-demo-app] Sending calculator command", {
        label,
        inputType: input.type,
        commandName: command.name,
        commandJson: command.json,
      });
      await this.#calculator.execute(command);
      await syncDisplay();
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
