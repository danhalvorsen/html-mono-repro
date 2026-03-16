import type { IValidationMessage } from "./IValidationMessage.js";
 
export interface IRuleMessageFactory<T, TMessageModel extends object> {
  createAdapter(
    ruleName: string,
    model: T,
    messageModel: TMessageModel,
  ): IValidationMessage<TMessageModel>;
}