// command-query/Dispatcher/CommandDispatcher.ts
import { Result, NonUndefined } from '../../functional/result/result.js';
import { ICommand } from '../ICommand.js';
import { CommandHandler } from '../ICommandHandler.js';

type AnyCommand = ICommand<any>;
type AnyHandler = CommandHandler<AnyCommand, NonUndefined, NonUndefined>;

export class CommandDispatcher {
  constructor(
    private readonly handlers: ReadonlyArray<AnyHandler>
  ) {}

  dispatch<
    TCommand extends ICommand<any>,
    TResult extends NonUndefined,
    TError extends NonUndefined
  >(command: TCommand): Promise<Result<TResult, TError>> {

    const handler = this.handlers.find(
      h => h.constructor.name === `${command.name}Handler`
    ) as CommandHandler<TCommand, TResult, TError> | undefined;

    if (!handler) {
      throw new Error(`No handler found for ${command.name}Handler`);
    }

    return handler.handle(command);
  }
}
