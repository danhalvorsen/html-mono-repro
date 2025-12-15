import { ExceptionContext } from "./ExceptionContext.js";
import { IExceptionTemplate } from "./ITemplate.js";

export class DefaultExceptionTemplate implements IExceptionTemplate {
  render(model: ExceptionContext): string {
    return `${model.message}\n${model.stack ?? 'No stacktrace'}`;
  }

  renderException(context: ExceptionContext): string {
    return this.render(context);
  }
}
