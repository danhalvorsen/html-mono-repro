import { Polygon, SvgPolygon } from "@monorepo/game-assets-shapes";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "../Game/index.js";
@customElement("view-game-polygon")
export class ViewGamePolygon extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #bdc8f4;
    }
  `;

  private readonly polygon = new SvgPolygon(
    new Polygon([
      { x: 30, y: 190 },
      { x: 120, y: 30 },
      { x: 230, y: 70 },
      { x: 300, y: 180 },
      { x: 210, y: 250 },
      { x: 90, y: 230 }
    ]),
    { fill: "#3559d9", stroke: "#9ab2ff", strokeWidth: 2 }
  );

  private readonly polygon2 = new SvgPolygon(
    new Polygon([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 0 }
    ]),
    { fill: "#3559d9", stroke: "#9ab2ff", strokeWidth: 2 }
  );

  protected render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Game Polygon View</h2>
        <game-polygon .width=${340} .height=${280} .polygon=${this.polygon}></game-polygon>
        <game-polygon .width=${240} .height=${180} .polygon=${this.polygon2}></game-polygon>
        <player-game-object>
          
        </player-game-object>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-game-polygon": ViewGamePolygon;
  }
}

