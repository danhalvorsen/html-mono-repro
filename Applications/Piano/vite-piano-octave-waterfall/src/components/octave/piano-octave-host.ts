import { LitElement, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import "./piano-octave";

export class PianoOctaveHost extends LitElement {
  @property({ type: Number })
  public gap = 4;

  @property({ type: String })
  public width = "640px";

  @property({ type: String })
  public height = "200px";

  protected override render(): TemplateResult {
    return html`
      <piano-octave
        .gap=${this.gap}
        .width=${this.width}
        .height=${this.height}
      ></piano-octave>
      
    `;
  }
}

customElements.define("piano-octave-host", PianoOctaveHost);