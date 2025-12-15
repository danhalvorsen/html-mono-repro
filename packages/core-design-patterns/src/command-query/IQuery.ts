
export interface IQuery<TPayload> {
  commandName: string;
  payload: TPayload;
}
