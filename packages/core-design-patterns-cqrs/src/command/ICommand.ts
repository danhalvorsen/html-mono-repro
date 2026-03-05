import { ICommandBase } from "./ICommandBase.js";

export interface ICommand<TMessage extends ICommandBase> {
  readonly json: string; // serialized JSON
}
