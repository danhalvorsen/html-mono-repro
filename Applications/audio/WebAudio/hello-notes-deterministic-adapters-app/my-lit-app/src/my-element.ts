import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { MenuViewChangeDetail } from "./menu-wc.js";
import "./menu-wc.js";
import "./menu-item.js";
import "./views/view-midi-converter.js";

type AppView = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly render: () => TemplateResult;
};

const views: readonly AppView[] = [
  {
    id: "midi-converter",
    label: "MIDI Converter",
    icon: "♪",
    render: () => html`<view-midi-converter></view-midi-converter>`
  }
];

@customElement("my-element")
export class MyElement extends LitElement {
  @state()
  private activeViewId = views[0]?.id ?? "";

  protected render() {
    const activeView = views.find((view) => view.id === this.activeViewId) ?? views[0];

    return html`
      <div class="layout">
        <menu-wc title="Audio App" @view-change=${this.onViewChange}>
          ${views.map(
            (view) => html`
              <menu-item
                .viewId=${view.id}
                .label=${view.label}
                .icon=${view.icon}
                .active=${this.activeViewId === view.id}
              ></menu-item>
            `
          )}
        </menu-wc>

        <section class="view-panel">${activeView ? activeView.render() : html``}</section>
      </div>
    `;
  }

  private onViewChange(event: Event): void {
    const customEvent = event as CustomEvent<MenuViewChangeDetail>;
    this.activeViewId = customEvent.detail.viewId;
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100svh;
      color: #111111;
      background: #ffffff;
      font: 16px/1.5 "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .layout {
      display: grid;
      min-height: 100svh;
      grid-template-columns: 280px 1fr;
    }

    .view-panel {
      padding: 18px;
      background: #ffffff;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
