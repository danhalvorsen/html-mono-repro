import { IPayload } from "./IPayload.js";

export interface ICommand<TPayload extends IPayload> {
  readonly name: string;
  readonly payload: TPayload;
}