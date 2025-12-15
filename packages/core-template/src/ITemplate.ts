import { ExceptionContext } from "./ExceptionContext.js";

export interface ITemplate<T = Record<string, any>> {
  render(model: T): string;
}

export type TemplateValue = string | number | boolean | null | undefined | TemplateValue[] | { [key: string]: TemplateValue };

export interface ITemplateModel {
  [key: string]: TemplateValue
}

export interface IExceptionTemplate extends ITemplate<ExceptionContext> {
  renderException(context: ExceptionContext): string;
}

