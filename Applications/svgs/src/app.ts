import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "./view.js";
import "./inspectors/anchors.js";
import "./inspectors/constraints.js";
import { buildDemoScene } from "./demo.js";

@customElement("svgs-app")
export class SvgsApp extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 1fr 320px;
      height: 100vh;
    }
    aside {
      background: #252526;
      border-left: 1px solid #333;
      padding: 8px;
      box-sizing: border-box;
      overflow: auto;
    }
  `;

  private readonly scene = buildDemoScene();

  render() {
    return html`
      <svgs-view .scene=${this.scene}></svgs-view>
      <aside>
        <h3>Inspectors</h3>
        <anchor-inspector .scene=${this.scene}></anchor-inspector>
        <constraint-inspector .scene=${this.scene}></constraint-inspector>
      </aside>
    `;
  }
}
