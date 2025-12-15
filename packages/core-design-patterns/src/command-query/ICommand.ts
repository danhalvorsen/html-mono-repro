import { NonUndefined } from '../functional/result/result.js';

export interface ICommand<TPayload > {
 
  payload: TPayload;
}
