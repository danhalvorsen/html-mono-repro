import { IQueryBase } from "./IQueryBase.js";


export interface IQuery<TMessage extends IQueryBase> {
  readonly json: string;
}
