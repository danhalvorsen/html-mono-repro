import type { ICommandBase } from '@monorepo/core-design-patterns-cqrs';
export interface RectangleMetadata {
  type: string; //<-- DrawingShapeType enum value as string
  text: string; // 
}
export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly metadata: RectangleMetadata;
}

export class SaveCommand implements ICommandBase {
  public constructor(
    public readonly rectangles: ReadonlyArray<Rectangle>,
  ) {}
}