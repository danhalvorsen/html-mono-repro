import { LitElement, html, svg, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DefaultPianoRootConfiguration,
  type PlayedNoteConfiguration,
} from "../piano/PianoRootConfiguration";

@customElement("played-note-wc")
export class PlayedNoteWc extends LitElement {
  @property({ attribute: false })
  public options: PlayedNoteConfiguration =
    DefaultPianoRootConfiguration.waterfall.columns[0]?.playedNote ??
    (() => {
      throw new Error("Missing default played-note configuration.");
    })();

  public startFall(columnHeightPx: number): void {
    const safeColumnHeight = Math.max(0, columnHeightPx);
    const distancePx = Math.max(0, safeColumnHeight - this.options.size.y);
    this.style.top = "0px";

    // Newton free-fall model (no drag): s = 0.5 * g * t^2
    // In free fall, acceleration is mass-independent, so m is not used.
    const gravityPxPerSecondSquared = Math.max(120, this.options.speedPxPerSecond * 6);
    const startedAtMs = performance.now();

    const tick = (): void => {
      const elapsedSeconds = Math.max(0, (performance.now() - startedAtMs) / 1000);
      const traveledPx = 0.5 * gravityPxPerSecondSquared * elapsedSeconds * elapsedSeconds;
      const clampedPx = Math.min(distancePx, traveledPx);

      this.style.top = `${clampedPx}px`;

      if (clampedPx >= distancePx) {
        this.remove();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

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