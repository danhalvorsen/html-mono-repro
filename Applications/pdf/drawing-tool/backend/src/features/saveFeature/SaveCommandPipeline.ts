// Applications/pdf/drawing-tool/backend/src/features/saveFeature/SaveCommandPipeline.ts

import {
  Pipeline,
  type IContextPipeline,
  type IBehaviorResult,
} from '@monorepo/core-design-patterns-mediator';

import { SaveCommandMessage } from './SaveCommandMessage.js';
import { SaveCommandPipelineHandler } from './SaveCommandPipelineHandler.js';
import type { SaveCommandSuccess } from './SaveCommandSuccess.js';
import { FooBehavior } from '../../infrastructure/cross-cutting-concerns/FooBehavior.js';
import { BlaBehavior } from '../../infrastructure/cross-cutting-concerns/BlaBehavior.js';
 
export class SaveCommandPipeline extends Pipeline<
  SaveCommandMessage,
  SaveCommandSuccess,
  IBehaviorResult
> {
  public constructor(
    saveDirectory: string,
    now: () => number = () => Date.now(),
  ) {
    super(
      [
        new FooBehavior<SaveCommandMessage>(),
        new BlaBehavior<SaveCommandMessage>(),
      ],
      new SaveCommandPipelineHandler(saveDirectory, now),
    );
  }

  public override async execute(
    ctx: IContextPipeline,
    msg: SaveCommandMessage,
  ) {
    console.log(`[SaveCommandPipeline] Start: ${msg.name}`);
    const result = await super.execute(ctx, msg);
    console.log(
      `[SaveCommandPipeline] End: ${result.isOk() ? 'ok' : 'err'}`,
    );
    return result;
  }
}
