import { Composite } from "../core/composite.js";
import type { Component } from "../core/component.js";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export class ButtonUI extends Composite {
    constructor(child: Component, public readonly variant: ButtonVariant = "primary") {
        super("Button", [child]);
    }

    protected createHostElement(): HTMLElement {
        const el = document.createElement("ui-button");
        el.setAttribute("variant", this.variant);
        el.setAttribute("label", this.children[0]?.name ?? "");
        return el;
    }
}
