import type { ICommandBase } from '@monorepo/core-design-patterns-cqrs';

export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class SaveCommand implements ICommandBase {
  public constructor(
    public readonly rectangles: ReadonlyArray<Rectangle>,
  ) {}
}