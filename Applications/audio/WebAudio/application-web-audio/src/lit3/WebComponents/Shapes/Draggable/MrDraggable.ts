// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Shapes/Draggable/MrDraggable.ts

import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { IDraggable, Point } from "../../IDraggable.js";
import { Shape } from "../Shape/Shape.js";

@customElement("mr-draggable")
export class MrDraggable extends LitElement implements IDraggable {
  @query("slot")
  private slotElement!: HTMLSlotElement;

  private shapeRef!: Shape;

  public get shape(): Shape {
    return this.shapeRef;
  }

  protected override firstUpdated(): void {
    this.shapeRef = this.resolveShape();
  }

  public containsPoint(point: Point): boolean {
    const shape = this.shapeRef as unknown as {
      containsPoint(p: Vector2): boolean;
    };

    return shape.containsPoint(new Vector2(point.x, point.y));
  }

  public getPosition(): Point {
    const shape = this.shapeRef as unknown as {
      getPosition(): Vector2;
    };

    const position = shape.getPosition();

    return {
      x: position.x,
      y: position.y,
    };
  }

  public setPosition(position: Point): void {
    const shape = this.shapeRef as unknown as {
      setPosistion(p: Vector2): void;
    };

    shape.setPosistion(new Vector2(position.x, position.y));
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private resolveShape(): Shape {
    const element = this.slotElement.assignedElements({ flatten: true })[0];

    if (!(element instanceof Shape)) {
      throw new Error("mr-draggable requires one slotted Shape.");
    }

    return element;
  }
}