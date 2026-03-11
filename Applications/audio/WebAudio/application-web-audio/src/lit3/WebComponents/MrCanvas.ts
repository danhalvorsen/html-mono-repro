
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import { MouseController } from "../Controllers/MouseController.js";
import { DragController } from "../Controllers/DragController.js";
import type { IDraggable } from "./IDraggable.js";
import type { IShape } from "./Shapes/IShape.js";

@customElement("mr-canvas")
export class MrCanvas extends LitElement {
  @query("canvas")
  private canvas!: HTMLCanvasElement;

  @query("slot")
  private slotElement!: HTMLSlotElement;

  private readonly drag = new DragController(
    this,
    () => this.getDraggables(),
    (event) => this.toCanvasPoint(event),
  );

  private readonly mouse = new MouseController(this, this.drag);
  private resizeObserver: ResizeObserver | null = null;

  public static override styles = css`
    :host {
      display: block;
      position: relative;
      border: 1px solid red;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      border: 1px solid yellow;
      background: #222;
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
    this.mouse.attach(this.canvas);

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
    this.mouse.detach();
    super.disconnectedCallback();
  }

  private readonly onSlotChange = (): void => {
    this.draw();
  };

  private getDraggables(): readonly IDraggable[] {
    const elements = this.slotElement.assignedElements({ flatten: true });
    const draggables: IDraggable[] = [];

    for (const element of elements) {
      const candidate = element as unknown as Partial<IDraggable>;

      if (
        typeof candidate.getPosition === "function" &&
        typeof candidate.setPosition === "function" &&
        typeof candidate.containsPoint === "function" &&
        "shape" in candidate
      ) {
        draggables.push(candidate as IDraggable);
      }
    }

    return draggables;
  }

  private resizeCanvas(): void {
    const rect = this.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private draw(): void {
    const ctx = this.canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    const rect = this.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (const draggable of this.getDraggables()) {
      const shape = this.tryGetShape(draggable);

      if (shape === null) {
        continue;
      }

      shape.draw({
        canvas: this.canvas,
        ctx,
      });
    }
  }

  private tryGetShape(draggable: IDraggable): IShape | null {
    try {
      const shape = draggable.shape;

      if (!shape || typeof shape.draw !== "function") {
        return null;
      }

      return shape;
    } catch {
      return null;
    }
  }

  private toCanvasPoint(event: MouseEvent): Readonly<{ x: number; y: number }> {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}