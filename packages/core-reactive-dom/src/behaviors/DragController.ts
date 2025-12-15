import { DomReactiveController } from "../services/DomReactiveController.js";

/**
 * Simple drag behavior using pointer events.
 */
export class DragController extends DomReactiveController {
  private dragging = false;
  private offsetX = 0;
  private offsetY = 0;

  protected onAttach(): void {
    this.element.addEventListener("pointerdown", this.onPointerDown);
  }

  protected onDetach(): void {
    this.element.removeEventListener("pointerdown", this.onPointerDown);
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.offsetX = e.clientX - this.element.offsetLeft;
    this.offsetY = e.clientY - this.element.offsetTop;
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.element.style.left = `${e.clientX - this.offsetX}px`;
    this.element.style.top = `${e.clientY - this.offsetY}px`;
  };

  private onPointerUp = () => {
    this.dragging = false;
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  };
}
