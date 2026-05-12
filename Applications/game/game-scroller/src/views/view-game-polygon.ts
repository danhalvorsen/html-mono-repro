import { Vector2 } from "@monorepo/core-math";
import { Polygon, SvgPolygon } from "@monorepo/game-design-svg";
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
      new Vector2(30, 190),
      new Vector2(120, 30),
      new Vector2(230, 70),
      new Vector2(300, 180),
      new Vector2(210, 250),
      new Vector2(90, 230),
    ]),
    { fill: "#3559d9", stroke: "#9ab2ff", strokeWidth: 2 }
  );

  private readonly polygon2 = new SvgPolygon(
    new Polygon([
      new Vector2(0, 0),
      new Vector2(100, 0),
      new Vector2(100, 100),
      new Vector2(0, 100),
      new Vector2(0, 0),
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
LitElement