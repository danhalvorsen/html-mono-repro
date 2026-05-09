import { LitElement, html, svg, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DefaultPianoRootConfiguration,
  type PlayedNoteConfiguration,
} from "../PianoRootConfiguration";

@customElement("played-note-wc")
export class PlayedNoteWc extends LitElement {
  @property({ attribute: false })
  public options: PlayedNoteConfiguration =
    DefaultPianoRootConfiguration.waterfall.columns[0]?.playedNote ??
    (() => {
      throw new Error("Missing default played-note configuration.");
    })();

  protected override updated(): void {
    this.applyHostLayout();
  }

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.options.size.x}
        height=${this.options.size.y}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        ${svg`
          <path
            d="M 0 0 L 1 0 L 1 1 L 0 1 Z"
            fill=${this.options.fill}
            stroke=${this.options.strokeColor}
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          ></path>
        `}
      </svg>
    `;
  }

  private applyHostLayout(): void {
    this.style.position = "absolute";
    this.style.left = "0px";
    this.style.top = "0px";
    this.style.width = `${this.options.size.x}px`;
    this.style.height = `${this.options.size.y}px`;
    this.style.display = "block";
    this.style.pointerEvents = "none";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "played-note-wc": PlayedNoteWc;
  }
}