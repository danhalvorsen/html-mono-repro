import { Mouse } from "core-drag-controller-abstract";
import { Position } from "core-drag-controller-abstract";

export class DOMMouseController extends Mouse.BaseMouseController {
  private readonly target: HTMLElement;

  private readonly onMouseMoveBound: (e: MouseEvent) => void;
  private readonly onMouseDownBound: (e: MouseEvent) => void;
  private readonly onMouseUpBound: (e: MouseEvent) => void;
  private readonly onWheelBound: (e: WheelEvent) => void;

  constructor(target: HTMLElement) {
    super();
    this.target = target;

    this.onMouseMoveBound = (e: MouseEvent): void => this.handleMove(e);
    this.onMouseDownBound = (e: MouseEvent): void => this.handleDown(e);
    this.onMouseUpBound = (e: MouseEvent): void => this.handleUp(e);
    this.onWheelBound = (e: WheelEvent): void => this.handleWheel(e);

    this.target.addEventListener("mousemove", this.onMouseMoveBound);
    this.target.addEventListener("mousedown", this.onMouseDownBound);
    this.target.addEventListener("mouseup", this.onMouseUpBound);
    this.target.addEventListener("wheel", this.onWheelBound, { passive: true });
  }

  private toPosition(e: MouseEvent | WheelEvent): Position {
    const rect = this.target.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private handleMove(e: MouseEvent): void {
    this.emitMove(this.toPosition(e));
  }

  private handleDown(e: MouseEvent): void {
    this.emitDown(this.toPosition(e));
  }

  private handleUp(e: MouseEvent): void {
    this.emitUp(this.toPosition(e));
  }

  private handleWheel(e: WheelEvent): void {
    this.emitWheel(e.deltaY, this.toPosition(e));
  }

  dispose(): void {
    this.target.removeEventListener("mousemove", this.onMouseMoveBound);
    this.target.removeEventListener("mousedown", this.onMouseDownBound);
    this.target.removeEventListener("mouseup", this.onMouseUpBound);
    this.target.removeEventListener("wheel", this.onWheelBound);
  }
}
