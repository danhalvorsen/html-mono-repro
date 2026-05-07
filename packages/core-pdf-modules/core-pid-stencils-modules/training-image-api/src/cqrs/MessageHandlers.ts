import type { ICommand, ICommandBase, IQuery, IQueryBase } from "@monorepo/core-design-patterns-cqrs-no-json";

export interface ICommandMessageHandler<TMessage extends ICommandBase> {
  Handle(command: ICommand<TMessage>): Promise<unknown>;
}

export interface IQueryMessageHandler<TMessage extends IQueryBase> {
  Handle(query: IQuery<TMessage>): Promise<unknown>;
}