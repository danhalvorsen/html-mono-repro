import { describe, it, expect } from "vitest";

import { ButtonUI } from "../../src/input/button.js";
import { LabelUI } from "../../src/input/label.js";
import { createComponentFixture, expectTag, assertHostProps, $ } from "../fixtures/componentFixture.js";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonHost = { variant: ButtonVariant; disabled: boolean };

function createButton(options?: ConstructorParameters<typeof ButtonUI>[1]) {
  const model = new ButtonUI(new LabelUI("Submit"), options);
  const fx = createComponentFixture(model);

  // host contract
  expectTag(fx.element, "ui-button");

  // host props contract (and TS narrowing)
  assertHostProps<ButtonHost>(fx.element, ["variant", "disabled"]);
  const host = fx.element as HTMLElement & ButtonHost;

  return { ...fx, host };
}

describe("ButtonUI (model)", () => {
  it("defaults", () => {
    const { host } = createButton();

    expect(host.variant).toBe("primary");
    expect(host.disabled).toBe(false);
  });

  it("applies options", () => {
    const { host, element } = createButton({ variant: "secondary", disabled: true });

    expect(host.variant).toBe("secondary");
    expect(host.disabled).toBe(true);
    expect(element.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders child as light DOM", () => {
    const { element } = createButton();

    const label = $<HTMLElement>(element, "ui-label");
    expect(label.textContent).toBe("Submit");
  });
});