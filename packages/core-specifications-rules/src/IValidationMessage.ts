import { ITemplate } from '@monorepo/core-template';

export interface IValidationMessage<TModel extends object = Record<string, unknown>> {
  readonly code: string;
  readonly template: ITemplate<TModel>;
  readonly model: TModel;
  render(): string;
}