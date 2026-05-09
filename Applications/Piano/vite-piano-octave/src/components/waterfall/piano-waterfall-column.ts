import { LitElement, html, svg, type TemplateResult } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import "./played-note-wc";
import {
  DefaultPianoRootConfiguration,
  type PianoWaterfallColumnConfiguration,
} from "../PianoRootConfiguration";
import type { PlayedNoteWc } from "./played-note-wc";

@customElement("column-wc")
export class ColumnWc extends LitElement {
  @property({ attribute: false })
  public options: PianoWaterfallColumnConfiguration =
    DefaultPianoRootConfiguration.waterfall.columns[0] ??
    (() => {
      throw new Error("Missing default waterfall column configuration.");
    })();

  @queryAssignedElements({ flatten: true })
  private readonly assignedElements!: Element[];

  protected override firstUpdated(): void {
    this.propagateToPlayedNotes();
  }

  protected override updated(): void {
    this.applyHostLayout();
    this.propagateToPlayedNotes();
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

      <slot @slotchange=${this.onSlotChange}></slot>
    `;
  }

  private readonly onSlotChange = (): void => {
    this.propagateToPlayedNotes();
  };

  private propagateToPlayedNotes(): void {
    for (const child of this.assignedElements) {
      if (!this.isPlayedNote(child)) {
        continue;
      }

      child.options = this.options.playedNote;
      child.requestUpdate();
    }
  }

  private applyHostLayout(): void {
    this.style.position = "absolute";
    this.style.left = `${this.options.position.x}px`;
    this.style.top = `${this.options.position.y}px`;
    this.style.width = `${this.options.size.x}px`;
    this.style.height = `${this.options.size.y}px`;
    this.style.display = "block";
    this.style.overflow = "hidden";
  }

  private isPlayedNote(element: Element): element is PlayedNoteWc {
    return element.tagName.toLowerCase() === "played-note-wc";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "column-wc": ColumnWc;
  }
}