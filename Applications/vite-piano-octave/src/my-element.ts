import { LitElement, html, css } from "lit";
import "./components/piano-octave-host";

export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }
  `;

  render() {
    return html`
      <h1>Piano Octave</h1>
      <piano-octave-host gap="6"></piano-octave-host>
    `;
  }
}

customElements.define("my-element", MyElement);
