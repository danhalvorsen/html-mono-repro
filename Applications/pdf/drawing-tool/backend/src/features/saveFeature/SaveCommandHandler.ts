// Applications/pdf/drawing-tool/backend/src/features/saveFeature/SaveCommandHandler.ts

import { type Result, Ok, Err } from '@monorepo/core-design-patterns';
import { CommandHandler, type ICommand } from '@monorepo/core-design-patterns-cqrs';
import type { IBehaviorResult, Mediator } from '@monorepo/core-design-patterns-mediator';
import { Json } from '@monorepo/core-json';

import { SaveCommand } from './SaveCommand.js';
import { SaveCommandMessage } from './SaveCommandMessage.js';
import { SaveCommandPipelineContext } from './SaveCommandPipelineContext.js';
import type { SaveCommandSuccess } from './SaveCommandSuccess.js';
import { SaveCommandPipelineError } from './SaveCommandPipelineError.js';

export class SaveCommandHandler extends CommandHandler<
  SaveCommand,
  SaveCommandSuccess,
  string
> {
  public constructor(
    private readonly mediator: Mediator<
      SaveCommandMessage,
      SaveCommandSuccess,
      IBehaviorResult
    >,
  ) {
    super();
  }

  public override async Handle(
    command: ICommand<SaveCommand>,
  ): Promise<Result<SaveCommandSuccess, string>> {
    if (isInspectMode()) {
      debugger;
    }
    console.log('[SaveCommandHandler] Handle called.');
    try {
      const rectangles = this.extract(command);
      console.log(
        `[SaveCommandHandler] Dispatching SaveCommandMessage with ${rectangles.length} rectangle(s).`,
      );

      const result = await this.mediator.send(
        new SaveCommandMessage(rectangles),
        new SaveCommandPipelineContext(),
      );

      if (result.isErr()) {
        const reason = this.resolvePipelineReason(result.unwrapErr());
        console.log(`[SaveCommandHandler] Mediator returned error: ${reason}`);
        return Err(reason);
      }

      console.log('[SaveCommandHandler] Mediator returned success.');
      return Ok(result.unwrap());
    } catch (error: unknown) {
      console.log('[SaveCommandHandler] Handle failed with exception.');
      return Err(
        error instanceof Error ? error.message : 'Unexpected save command error.',
      );
    }
  }

  private extract(command: ICommand<SaveCommand>): ReadonlyArray<SaveCommand['rectangles'][number]> {
    const parsed = Json.deserialize<Partial<SaveCommand>>(command.json);

    if (!Array.isArray(parsed.rectangles)) {
      throw new Error('Expected payload with a "rectangles" array.');
    }

    return parsed.rectangles;
  }

  private resolvePipelineReason(error: IBehaviorResult): string {
    if (error instanceof SaveCommandPipelineError) {
      return error.reason;
    }

    if ('reason' in error && typeof error.reason === 'string') {
      return error.reason;
    }

    return 'Save command pipeline failed.';
  }
}

function isInspectMode(): boolean {
  return process.execArgv.some((arg) => arg.startsWith('--inspect'));
}
