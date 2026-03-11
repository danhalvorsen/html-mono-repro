import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import type { IDraggable, Point } from "../../IDraggable.js";
import type { IShape } from "../IShape.js";
 
type IPositionableShape = IShape & {
  x: number;
  y: number;
};

@customElement("mr-draggable")
export class MrDraggable extends LitElement implements IDraggable {

  @query("slot")
  private slotElement!: HTMLSlotElement;

  private shapeRef!: IPositionableShape;

  public get shape(): IShape {
    return this.shapeRef;
  }

  protected override firstUpdated(): void {
    this.shapeRef = this.resolveShape();
  }

  private resolveShape(): IPositionableShape {

    const element = this.slotElement.assignedElements({ flatten: true })[0];

    if (!element) {
      throw new Error("mr-draggable requires one slotted shape.");
    }

    if (!this.isShape(element)) {
      throw new Error("slotted element must implement IShape.");
    }

    return element;
  }

  private isShape(value: unknown): value is IPositionableShape {
    return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as IShape).draw === "function" &&
      typeof (value as any).containsPoint === "function" &&
      typeof (value as any).x === "number" &&
      typeof (value as any).y === "number"
    );
  }

  public containsPoint(point: Point): boolean {
    if (typeof (this.shapeRef as any).containsPoint === "function") {
      return (this.shapeRef as any).containsPoint(point.x, point.y);
    }
    const bounds = this.shapeRef.getBoundingBox();
    return (
      point.x >= bounds.min.x &&
      point.x <= bounds.max.x &&
      point.y >= bounds.min.y &&
      point.y <= bounds.max.y
    );
  }

  public getPosition(): Point {
    return {
      x: this.shapeRef.x,
      y: this.shapeRef.y
    };
  }

  public setPosition(position: Point): void {
    this.shapeRef.x = position.x;
    this.shapeRef.y = position.y;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}