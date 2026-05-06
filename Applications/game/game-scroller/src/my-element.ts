import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./menu-wc.js";
import "./menu-item.js";
import "./views/view-game.js";
import "./views/view-game-polygon.js";
import "./views/view-game-player-input.js";
import "./views/view-diagnostics.js";
import "./views/view-help.js";
import "./views/view-settings.js";
import type { MenuViewChangeDetail } from "./menu-wc.js";

const VIEW_IDS = Object.freeze({
  game: "game",
  gameRenderPolygon: "game - render a polygon",
  gamePlayerInput: "game - player keyboard",
  diagnostics: "diagnostics",
  help: "help",
  settings: "settings"
} as const);

type ViewMenuItem = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
};

const DEFAULT_VIEW_ITEMS: readonly ViewMenuItem[] = Object.freeze([
  { id: VIEW_IDS.game, label: "Game", icon: "🎮" },
  { id: VIEW_IDS.gameRenderPolygon, label: "Game - Render a Polygon", icon: "🔷" },
  { id: VIEW_IDS.gamePlayerInput, label: "Game - Player Keyboard", icon: "⌨️" },
  { id: VIEW_IDS.diagnostics, label: "Diagnostics", icon: "📈" },
  { id: VIEW_IDS.help, label: "Help", icon: "❓" },
  { id: VIEW_IDS.settings, label: "Settings", icon: "⚙️" }
]);

@customElement("my-element")
export class MyElement extends LitElement {
  private static readonly MENU_ITEMS_URL = "/menu-items.json";

  static styles = css`
    :host {
      display: block;
      min-height: 100svh;
      color: #e7ebff;
      background: #0f1118;
      font-family: "Segoe UI", system-ui, sans-serif;
    }

    .app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100svh;
    }

    menu-wc {
      min-height: 100svh;
    }

    .content {
      padding: 14px;
      overflow: auto;
    }

  `;

  @state()
  private currentView: string = VIEW_IDS.game;

  @state()
  private viewItems: readonly ViewMenuItem[] = DEFAULT_VIEW_ITEMS;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.loadMenuItemsFromJson();
  }

  private parseMenuItems(payload: unknown): readonly ViewMenuItem[] {
    if (!Array.isArray(payload)) return [];

    const parsed: ViewMenuItem[] = [];
    for (const entry of payload) {
      if (typeof entry !== "object" || entry === null) continue;
      const record = entry as Record<string, unknown>;
      const id = record.id;
      const label = record.label;
      const icon = record.icon;
      if (typeof id !== "string" || id.trim().length === 0) continue;
      if (typeof label !== "string" || label.trim().length === 0) continue;
      const safeIcon = typeof icon === "string" && icon.trim().length > 0 ? icon : "•";
      parsed.push({ id: id.trim(), label, icon: safeIcon });
    }

    return parsed;
  }

  private async loadMenuItemsFromJson(): Promise<void> {
    try {
      const response = await fetch(MyElement.MENU_ITEMS_URL);
      if (!response.ok) return;
      const payload: unknown = await response.json();
      const parsed = this.parseMenuItems(payload);
      if (parsed.length === 0) return;
      this.viewItems = parsed;
      if (!parsed.some((item) => item.id === this.currentView)) {
        this.currentView = parsed[0].id;
      }
    } catch (error) {
      console.error("Failed to load menu items from JSON.", error);
    }
  }

  private setCurrentView(viewId: string): void {
    this.currentView = viewId;
  }

  private onViewChange(event: Event): void {
    const customEvent = event as CustomEvent<MenuViewChangeDetail>;
    const { viewId } = customEvent.detail;
    const isKnownView = this.viewItems.some((item) => item.id === viewId);
    if (!isKnownView) return;
    this.setCurrentView(viewId);
  }

  private renderCurrentView(): TemplateResult {
    switch (this.currentView) {
      case VIEW_IDS.game:
        return html`<view-game></view-game>`;
      case VIEW_IDS.gameRenderPolygon:
        return html`<view-game-polygon></view-game-polygon>`;
      case VIEW_IDS.gamePlayerInput:
        return html`<view-game-player-input></view-game-player-input>`;
      case VIEW_IDS.diagnostics:
        return html`<view-diagnostics></view-diagnostics>`;
      case VIEW_IDS.help:
        return html`<view-help></view-help>`;
      case VIEW_IDS.settings:
        return html`<view-settings></view-settings>`;
      default:
        return html`<view-game></view-game>`;
    }
  }

  render() {
    return html`
      <main class="app-shell">
        <menu-wc
          title="Game Scroller"
          @view-change=${this.onViewChange}
        >
          ${this.viewItems.map(
            (view) => html`
              <menu-item
                .viewId=${view.id}
                .label=${view.label}
                .icon=${view.icon}
                .active=${this.currentView === view.id}
              ></menu-item>
            `
          )}
        </menu-wc>
        <section class="content">${this.renderCurrentView()}</section>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
