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

  private shapeRefs: readonly Shape[] = [];

  public get shape(): Shape {
    const first = this.shapeRefs[0];

    if (first === undefined) {
      throw new Error("mr-draggable requires at least one slotted Shape.");
    }

    return first;
  }

  protected override firstUpdated(): void {
    this.refreshShapes();
  }

  public containsPoint(point: Point): boolean {
    this.ensureShapesResolved();

    const delegated = this.tryGetDelegatedDraggable();
    if (delegated !== null) {
      return delegated.containsPoint(point);
    }

    const probe = new Vector2(point.x, point.y);

    for (const shape of [...this.shapeRefs].reverse()) {
      if (this.containsShapePoint(shape, probe)) {
        return true;
      }
    }

    return false;
  }

  public getPosition(): Point {
    this.ensureShapesResolved();

    const delegated = this.tryGetDelegatedDraggable();
    if (delegated !== null) {
      return delegated.getPosition();
    }

    const bounds = this.getBounds();

    return {
      x: bounds.min.x,
      y: bounds.min.y,
    };
  }

  public setPosition(position: Point): void {
    this.ensureShapesResolved();

    const delegated = this.tryGetDelegatedDraggable();
    if (delegated !== null) {
      delegated.setPosition(position);
      this.requestUpdate();
      return;
    }

    const current = this.getBounds().min;
    const next = new Vector2(position.x, position.y);
    const delta = next.subtract(current);

    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    for (const shape of this.shapeRefs) {
      shape.setPosistion(shape.getPosition().add(delta));
    }

    this.requestUpdate();
  }

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  private readonly onSlotChange = (): void => {
    this.refreshShapes();
  };

  private refreshShapes(): void {
    this.shapeRefs = this.resolveShapes();
  }

  private ensureShapesResolved(): void {
    if (this.shapeRefs.length > 0) {
      return;
    }

    this.refreshShapes();

    if (this.shapeRefs.length === 0) {
      throw new Error("mr-draggable requires at least one slotted Shape.");
    }
  }

  private resolveShapes(): readonly Shape[] {
    const assigned = this.slotElement?.assignedElements({ flatten: true }) ?? [];
    const result: Shape[] = [];

    for (const element of assigned) {
      this.collectShapes(element, result);
    }

    if (result.length === 0) {
      throw new Error("mr-draggable requires at least one slotted Shape.");
    }

    return result;
  }

  private collectShapes(element: Element, result: Shape[]): void {
    if (element instanceof Shape) {
      result.push(element);
      return;
    }

    for (const child of Array.from(element.children)) {
      this.collectShapes(child, result);
    }
  }

  private tryGetDelegatedDraggable(): IDraggable | null {
    if (this.shapeRefs.length !== 1) {
      return null;
    }

    const candidate = this.shapeRefs[0];
    return this.isDraggable(candidate) ? candidate : null;
  }

  private isDraggable(value: unknown): value is IDraggable {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Partial<IDraggable>;

    return (
      value instanceof Shape &&
      typeof candidate.getPosition === "function" &&
      typeof candidate.setPosition === "function" &&
      typeof candidate.containsPoint === "function" &&
      "shape" in candidate
    );
  }

  private containsShapePoint(shape: Shape, point: Vector2): boolean {
    const candidate = shape as unknown as {
      containsPoint?(value: Vector2): boolean;
      pointInsideShape?(value: Vector2, type: "circle" | "rectangle" | "edge"): boolean;
    };

    if (typeof candidate.containsPoint === "function") {
      return candidate.containsPoint(point);
    }

    if (typeof candidate.pointInsideShape === "function") {
      return candidate.pointInsideShape(point, "rectangle");
    }

    return false;
  }

  private getBounds(): { min: Vector2; max: Vector2 } {
    const first = this.shapeRefs[0];

    if (first === undefined) {
      throw new Error("mr-draggable requires at least one slotted Shape.");
    }

    let minX = first.getPosition().x;
    let minY = first.getPosition().y;
    let maxX = first.getPosition().x + first.getWidth();
    let maxY = first.getPosition().y + first.getHeight();

    for (let index = 1; index < this.shapeRefs.length; index++) {
      const shape = this.shapeRefs[index];

      if (shape === undefined) {
        continue;
      }

      const position = shape.getPosition();
      const width = shape.getWidth();
      const height = shape.getHeight();

      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + width);
      maxY = Math.max(maxY, position.y + height);
    }

    return {
      min: new Vector2(minX, minY),
      max: new Vector2(maxX, maxY),
    };
  }
}