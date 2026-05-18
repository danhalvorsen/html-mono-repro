// Applications/Lit/svg-rect/src/svgs/Draggable-rect-svg.ts
import { LitElement, html, svg } from "lit";
import { customElement, query } from "lit/decorators.js";

import { DragController } from "../../../../controllers/DragController.js";
import { ScaleController } from "../../../../controllers/ScaleController.js";
import { RectModel } from "../../../../controllers/types.js";

import { SvgCanvas } from "../../../../svgs/SvgCanvas.js";
import { GridToggleController } from "../../../../controllers/GridToggleController.js";

@customElement("svg-rectangle")
export class SvgRectangle extends LitElement {
  private canvas?: SvgCanvas;
  private readonly rect = new RectModel();

  private readonly drag = new DragController(this, this.rect);
  private readonly scale = new ScaleController(this, this.rect);

  private readonly gridToggle = new GridToggleController(this, () => this.canvas);

  @query("svg") private readonly svgEl!: SVGSVGElement;

  protected firstUpdated(): void {
    this.canvas = new SvgCanvas(this, this.svgEl);

    // Canvas is the viewBox authority; sync AFTER layout.
    this.canvas.syncViewBoxToViewport();

    // Apply any toggle that happened before firstUpdated
    this.gridToggle.applyBufferedState();
  }

  disconnectedCallback(): void {
    this.canvas?.dispose();
    super.disconnectedCallback();
  }

  render() {
    const r = 3;
    const { x, y, w, h } = this.rect;

    return html`
      <svg width="1500" height="400" style="border:2px solid #ccc;">
        ${svg`
          <rect
            x="${x}"
            y="${y}"
            width="${w}"
            height="${h}"
            fill="yellow"
            fill-opacity="0.3"
            stroke="yellow"
            stroke-width="1"
            @pointerdown=${(e: PointerEvent) => {
              this.drag.beginDrag();
              this.canvas?.beginPointer(e);
            }}
          ></rect>

          <circle
            cx="${x}"
            cy="${y}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("nw");
              this.canvas?.beginPointer(e);
            }}
          ></circle>

          <circle
            cx="${x + w}"
            cy="${y}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("ne");
              this.canvas?.beginPointer(e);
            }}
          ></circle>

          <circle
            cx="${x + w}"
            cy="${y + h}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("se");
              this.canvas?.beginPointer(e);
            }}
          ></circle>

          <circle
            cx="${x}"
            cy="${y + h}"
            r="${r}"
            fill="yellow"
            @pointerdown=${(e: PointerEvent) => {
              this.scale.beginScale("sw");
              this.canvas?.beginPointer(e);
            }}
          ></circle>
        `}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rectangle-svg": SvgRectangle;
  }
}