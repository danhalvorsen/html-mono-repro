import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "./components/___tangent";
import { LEGACY_ALL_TANGENTS } from "./octave/geometry/DefaultOctaveGeometry";

@customElement("tangent-demo")
export class TangentDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-top: 24px;
      font-family: system-ui, sans-serif;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
    }

    .card {
      border: 1px solid #d0d0d0;
      border-radius: 8px;
      padding: 8px;
      background: #fafafa;
    }

    .card.black {
      background: #f0f0f0;
    }

    .label {
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    piano-tangent {
      display: block;
      width: 100%;
    }
  `;

  render() {
    return html`
      <section>
        <h2>All Tangents Demo</h2>
        <div class="grid">
          ${LEGACY_ALL_TANGENTS.map((key) => {
            const isBlack = key.name.includes("s");
            return html`
              <article class="card ${isBlack ? "black" : "white"}">
                <div class="label">${key.name}</div>
                <piano-tangent .tangentId=${key.name} .isBlack=${isBlack} .geometry=${key}></piano-tangent>
              </article>
            `;
          })}
        </div>
      </section>
    `;
  }
}
