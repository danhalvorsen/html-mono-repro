import { Composite } from "../core/composite.js";
import type { Component } from "../core/component.js";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonUIOptions {
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
}

type ButtonHost = HTMLElement & {
  variant: ButtonVariant;
  disabled: boolean;
  label: string;
};

export class ButtonUI extends Composite {
  public readonly variant: ButtonVariant;
  public readonly disabled: boolean;

  public constructor(
    child: Component,
    options: ButtonVariant | ButtonUIOptions = "primary",
  ) {
    super("Button", [child]);

    const normalized = ButtonUI.normalizeOptions(options);

    this.variant = normalized.variant ?? "primary";
    this.disabled = normalized.disabled ?? false;
  }

  protected createHostElement(): HTMLElement {
    const element = document.createElement("ui-button") as ButtonHost;
    const label = this.children[0]?.name ?? "";

    element.variant = this.variant;
    element.disabled = this.disabled;
    element.label = label;

    element.setAttribute("variant", this.variant);
    element.setAttribute("label", label);
    element.setAttribute("aria-disabled", this.disabled ? "true" : "false");

    if (this.disabled) {
      element.setAttribute("disabled", "");
    }

    return element;
  }

  private static normalizeOptions(
    options: ButtonVariant | ButtonUIOptions,
  ): ButtonUIOptions {
    if (typeof options === "string") {
      return {
        variant: options,
      };
    }

    return options;
  }
}
