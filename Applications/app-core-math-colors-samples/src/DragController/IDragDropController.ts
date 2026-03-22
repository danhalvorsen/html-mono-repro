// Applications/app-core-math-colors-samples/src/Gradient/DragController/IDragDropController.ts

export interface IDragDropController {
  onPointerDown(event: PointerEvent): void;
  onClick(event: MouseEvent): void;
}