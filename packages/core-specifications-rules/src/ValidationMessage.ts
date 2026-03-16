// packages/core-specifications-rules/src/ValidationMessage.ts

import type { ITemplate } from "@monorepo/core-template";
import type { IValidationMessage } from "./IValidationMessage.js";

export class ValidationMessage<TModel extends object = Record<string, unknown>>
  implements IValidationMessage<TModel>
{
  public readonly code: string;
  public readonly template: ITemplate<TModel>;
  public readonly model: TModel;

  public constructor(
    code: string,
    template: ITemplate<TModel>,
    model: TModel,
  ) {
    this.code = code;
    this.template = template;
    this.model = model;
  }

  public render(): string {
    return this.template.render(this.model);
  }
}