// src/lit3/WebComponents/MrDraggable.ts

import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";

import type { IDraggable, Point } from "../../IDraggable.js";
import type { IShape } from "../IShape.js";

@customElement("mr-draggable")
export class MrDraggable extends LitElement implements IDraggable {
  @query("slot")
  private slotElement!: HTMLSlotElement;

  public get shape(): IShape {
    const shape = this.slotElement
      .assignedElements({ flatten: true })[0] as IShape | undefined;

    if (!shape) {
      throw new Error("mr-draggable requires one slotted IShape.");
    }

    return shape;
  }

  public containsPoint(point: Point): boolean {
    return this.shape.containsPoint(point.x, point.y);
  }

  public getPosition(): Point {
    return {
      x: this.shape.x,
      y: this.shape.y
    };
  }

  public setPosition(position: Point): void {
    this.shape.x = position.x;
    this.shape.y = position.y;
  }

  protected render() {
    return html`<slot></slot>`;
  }
}