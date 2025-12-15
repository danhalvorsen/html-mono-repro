 
import { Result } from '../functional/result/returnOne.js';
import { ICommand } from './ICommand.js';

export interface ICommandHandler<TCommand>  
 {
  handle(command: TCommand): Promise<Result<TCommand>>;
}

