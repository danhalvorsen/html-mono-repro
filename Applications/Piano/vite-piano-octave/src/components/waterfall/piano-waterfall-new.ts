import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./piano-waterfall-column";
import type { PianoWaterfallConfiguration } from "../piano/PianoRootConfiguration";
import {
  DefaultPianoRootConfiguration,
} from "../piano/PianoRootConfiguration";
import type { ColumnWc } from "./piano-waterfall-column";

@customElement("piano-waterfall-new")
export class PianoWaterfallNew extends LitElement {
  @property({ attribute: false })
  public options: PianoWaterfallConfiguration =
    DefaultPianoRootConfiguration.waterfall;

  protected override firstUpdated(): void {
    this.propagateToColumns();
  }

  protected override updated(): void {
    this.applyHostLayout();
    this.propagateToColumns();
  }

  protected override render(): TemplateResult {
    return html`
      ${this.options.columns.map((_, index) => html`
        <slot name=${`column-${index}`} @slotchange=${this.onSlotChange}></slot>
      `)}
    `;
  }

  private readonly onSlotChange = (): void => {
    this.propagateToColumns();
  };

  private propagateToColumns(): void {
    for (let index = 0; index < this.options.columns.length; index += 1) {
      const columnOptions = this.options.columns[index];
      const slot = this.shadowRoot?.querySelector(`slot[name="column-${index}"]`);

      if (columnOptions === undefined || !(slot instanceof HTMLSlotElement)) {
        continue;
      }

      const columns = slot.assignedElements({ flatten: true }).filter(this.isColumn);

      for (const column of columns) {
        column.options = columnOptions;
        column.requestUpdate();
      }
    }
  }

  private applyHostLayout(): void {
    this.style.position = "absolute";
    this.style.left = `${this.options.position.x}px`;
    this.style.top = `${this.options.position.y}px`;
    this.style.width = `${this.options.size.x}px`;
    this.style.height = `${this.options.size.y}px`;
    this.style.display = "block";
  }

  private isColumn(element: Element): element is ColumnWc {
    return element.tagName.toLowerCase() === "column-wc";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-waterfall-new": PianoWaterfallNew;
  }
}