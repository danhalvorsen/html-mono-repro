// Applications/composistion/composistion-demo-03/src/demo-app.ts
// PATCH: remove ALL `.name` usage on CalculatorCommand/GetDisplayQry envelopes.
// CQRS envelopes are `{ json }` only. Put `name` inside JSON.
// Also switch to CalculatorCommandFactory (already added).

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { Calculator } from "./calculator/calculator.js";
import { CalculatorFsm } from "./calculator/calculator.fsm.js";

import "@monorepo/core-design-composite";
import type { Component } from "@monorepo/core-design-composite";

import type { CalculatorInput, Digit, Operator } from "./calculator/calculator.types.js";
import { InputType } from "./calculator/calculator.types.js";

import { CalculatorCqrs } from "./calculator/calculator.cqrs.js";
import type { GetDisplayQry } from "./calculator/calculator.cqrs.messages.js";
import { CalculatorMessageName } from "./calculator/calculator.cqrs.names.js";
import { CalculatorCommandFactory } from "./calculator/calculator.command.factory.js";
import { UI } from "./calculator/ui.js";

/* ============================= Label -> Input mapping ============================= */

function isDigitLabel(x: string): x is Digit {
  return x.length === 1 && x >= "0" && x <= "9";
}
function isOperatorLabel(x: string): x is Operator {
  return x === "+" || x === "-" || x === "*" || x === "/";
}

function inputFromLabel(label: string): CalculatorInput | undefined {
  if (isDigitLabel(label)) return { type: InputType.Digit, payload: { d: label } };
  if (isOperatorLabel(label)) return { type: InputType.Operator, payload: { op: label } };
  if (label === "CR") return { type: InputType.CR, payload: undefined };
  if (label === "=" || label.includes("=")) return { type: InputType.Equals, payload: undefined };
  return undefined;
}

/* ============================= CQRS envelope helpers ============================= */

const parseName = (json: string): string => {
  try {
    const x = JSON.parse(json) as { name?: string };
    return x.name ?? "missing-name";
  } catch {
    return "invalid-json";
  }
};

const getDisplayQry = (): GetDisplayQry => ({
  json: JSON.stringify({ name: CalculatorMessageName.GetDisplay }),
});

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

  #calculator?: CalculatorCqrs;
  #cmdFactory = new CalculatorCommandFactory();

  readonly #ui: Component = UI.make();

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

      const result = await this.#calculator.query(getDisplayQry());
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
      if (!(target instanceof HTMLElement) || target.tagName !== "UI-BUTTON") return;

      const detail = (e as CustomEvent).detail as
        | { calculatorButton?: { label?: string } }
        | undefined;

      const label =
        String(detail?.calculatorButton?.label ?? "").trim() ||
        String(target.textContent ?? "").trim();

      const input = inputFromLabel(label);
      if (!input) return;

      if (!this.#calculator) return;

      // Build CQRS command envelope via factory
      const command =
        input.type === InputType.Digit ? this.#cmdFactory.digit(input.payload.d) :
        input.type === InputType.Operator ? this.#cmdFactory.operator(input.payload.op) :
        input.type === InputType.Equals ? this.#cmdFactory.equal() :
        this.#cmdFactory.clear();

      console.info("[ui-demo-app] Sending calculator command", {
        label,
        inputType: input.type,
        commandName: parseName(command.json),
        commandJson: command.json,
      });

      await this.#calculator.execute(command as any);
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