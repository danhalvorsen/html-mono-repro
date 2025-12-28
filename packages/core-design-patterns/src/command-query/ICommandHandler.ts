import { Result, NonUndefined } from '../functional/result/result.js';
import { ICommand } from './ICommand.js';
 
export abstract class CommandHandler<
  TCommand extends ICommand<any>,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  abstract handle(command: TCommand): Promise<Result<TResult, TError>>;
}