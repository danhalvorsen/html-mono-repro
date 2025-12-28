import { IPayload } from './IPayload.js';

export interface IQuery<TPayload extends IPayload> {
  readonly name: string;
  readonly payload: TPayload;
}