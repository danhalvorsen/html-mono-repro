import { LitElement, html } from "lit";
import { state } from "lit/decorators.js";

import "./views/demo-shell-view.ts";
import "./views/sprint-one-view.ts";
import "./views/sprint-three-one-view.ts";
import "./views/sprint-three-view.ts";
import "./views/sprint-four-view.ts";
import "./views/sprint-two-view.ts";

// TODO: Add `sprint-5` route and `sprint-five-view.ts` when Sprint 5 demo features are ready.
type DemoRoute = "sprint-1" | "sprint-2" | "sprint-3" | "sprint-3-1" | "sprint-4";

function readRoute(): DemoRoute {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "sprint-2") {
    return "sprint-2";
  }

  if (hash === "sprint-3") {
    return "sprint-3";
  }

  if (hash === "sprint-3-1") {
    return "sprint-3-1";
  }

  if (hash === "sprint-4") {
    return "sprint-4";
  }

  return "sprint-1";
}

export class MyElement extends LitElement {
  @state()
  private currentRoute: DemoRoute = readRoute();

  public override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("hashchange", this.handleHashChange);
  }

  public override disconnectedCallback(): void {
    window.removeEventListener("hashchange", this.handleHashChange);
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <demo-shell-view .currentRoute=${this.currentRoute}>
        ${this.currentRoute === "sprint-1"
          ? html`<sprint-one-view></sprint-one-view>`
          : this.currentRoute === "sprint-2"
            ? html`<sprint-two-view></sprint-two-view>`
            : this.currentRoute === "sprint-3"
              ? html`<sprint-three-view></sprint-three-view>`
              : this.currentRoute === "sprint-3-1"
                ? html`<sprint-three-one-view></sprint-three-one-view>`
                : html`<sprint-four-view></sprint-four-view>`}
      </demo-shell-view>
    `;
  }

  private readonly handleHashChange = (): void => {
    this.currentRoute = readRoute();
  };
}

customElements.define("my-element", MyElement);
