import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import { MouseController } from "../Controllers/MouseController.js";
import { DragController } from "../Controllers/DragController.js";
import type { IDraggable } from "./IDraggable.js";
import type { IShape } from "./IShape.js";

@customElement("mr-canvas")
export class MrCanvas extends LitElement {
  @query("canvas")
  private canvas!: HTMLCanvasElement;

  @query("slot")
  private slotElement!: HTMLSlotElement;

  private readonly mouse = new MouseController(this);
  private readonly drag = new DragController(this, this.mouse);
  private resizeObserver: ResizeObserver | null = null;

  static styles = css`
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

  render() {
    return html`
      <canvas
        @mousedown=${this.onMouseDown}
        @mousemove=${this.onMouseMove}
        @mouseup=${this.onMouseUp}
      ></canvas>
      <slot @slotchange=${this.onSlotChange}></slot>
    `;
  }

  firstUpdated() {
    this.resizeCanvas();
    this.mouse.attach(this.canvas);

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.draw();
    });

    this.resizeObserver.observe(this);
    this.draw();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mouse.detach();
    super.disconnectedCallback();
  }

  private readonly onSlotChange = (): void => {
    this.draw();
  };

  private getDraggables(): IDraggable[] {
    const elements = this.slotElement.assignedElements({ flatten: true });

    return elements.filter((element): element is IDraggable => {
      const candidate = element as Partial<IDraggable>;
      return (
        typeof candidate.getPosition === "function" &&
        typeof candidate.setPosition === "function" &&
        typeof candidate.containsPoint === "function" &&
        "shape" in candidate
      );
    });
  }

  private resizeCanvas(): void {
    const rect = this.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private draw(): void {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const rect = this.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (const draggable of this.getDraggables()) {
      const shape = this.tryGetShape(draggable);

      if (!shape) {
        continue;
      }

      shape.draw({
        canvas: this.canvas,
        ctx
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

  private readonly onMouseDown = (event: MouseEvent): void => {
    const point = this.toCanvasPoint(event);

    for (const draggable of this.getDraggables()) {
      if (draggable.containsPoint(point)) {
        this.drag.startDrag(draggable, point.x, point.y);
        break;
      }
    }
  };

  private readonly onMouseMove = (_event: MouseEvent): void => {
    this.draw();
  };

  private readonly onMouseUp = (): void => {
  };

  public mouseEvent(event: MouseEvent): void {
    if (event.type === "mousemove") {
      this.draw();
    }
  }

  private toCanvasPoint(event: MouseEvent): Readonly<{ x: number; y: number }> {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}