export interface ICommand<TPayload> {
  readonly commandName: string;
  readonly payload: TPayload;
}

export interface IQuery<TPayload> {
  readonly commandName: string;
  readonly payload: TPayload;
}
