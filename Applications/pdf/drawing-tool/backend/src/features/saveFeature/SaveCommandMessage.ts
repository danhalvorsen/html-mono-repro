import type { IMessage } from '@monorepo/core-design-patterns-mediator';
import { Rectangle } from './SaveCommand.js';

export class SaveCommandMessage implements IMessage {
  public readonly name = 'SaveCommandMessage';

  public constructor(
 
      public readonly rectangles: ReadonlyArray<Rectangle> = []
  ) { }
}

