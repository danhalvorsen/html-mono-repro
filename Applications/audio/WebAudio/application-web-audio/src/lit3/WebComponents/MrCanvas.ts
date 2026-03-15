// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/MrCanvas.ts

import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import { DragController } from "../Controllers/DragController.js";
import { MouseController } from "../Controllers/MouseController.js";
import { ShapeController } from "../Controllers/ShapeController.js";

@customElement("mr-canvas")
export class MrCanvas extends LitElement {
  @query("canvas")
  private canvas!: HTMLCanvasElement;

  @query("slot")
  private slotElement!: HTMLSlotElement;

  private readonly shapeController = new ShapeController(this, () =>
    this.getAssignedElements(),
  );

  private readonly dragController = new DragController(this, () =>
    this.getAssignedElements(),
  );

  private readonly mouseController = new MouseController(
    this,
    this.dragController,
  );

  private resizeObserver: ResizeObserver | null = null;

  public static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      min-height: 320px;
      box-sizing: border-box;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 320px;
      background: #222;
      box-sizing: border-box;
    }

    slot {
      display: none;
    }
  `;

  protected override render() {
    return html`
      <canvas></canvas>
      <slot @slotchange=${this.onSlotChange}></slot>
    `;
  }

  protected override firstUpdated(): void {
    this.resizeCanvas();
    this.mouseController.attach(this.canvas);

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.draw();
    });

    this.resizeObserver.observe(this);
    this.draw();
  }

  protected override updated(): void {
    this.draw();
  }

  public override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mouseController.detach();
    super.disconnectedCallback();
  }

  private readonly onSlotChange = async (): Promise<void> => {
    await this.updateComplete;
    this.draw();
  };

  private getAssignedElements(): readonly Element[] {
    if (!this.slotElement) {
      return [];
    }

    // IMPORTANT: do NOT flatten
    return this.slotElement.assignedElements();
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;

    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    const context = this.canvas.getContext("2d");
    if (context === null) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private draw(): void {
    const context = this.canvas.getContext("2d");
    if (context === null) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);

    for (const shape of this.shapeController.getShapes()) {
      shape.draw({
        canvas: this.canvas,
        ctx: context,
      });
    }
  }
}
