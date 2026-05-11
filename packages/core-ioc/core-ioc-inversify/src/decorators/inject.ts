import "reflect-metadata";
import {
  inject as inversifyInject,
  type interfaces,
} from "inversify";

/**
 * Legacy decorator helper.
 *
 * The new façade does not expose decorators.
 */
export function Inject(id: interfaces.ServiceIdentifier | string): ParameterDecorator {
  const resolved =
    typeof id === "string"
      ? Symbol.for(`myioc:${id}`)
      : id;

  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    (inversifyInject(resolved) as unknown as ParameterDecorator)(
      target,
      propertyKey,
      parameterIndex,
    );
  };
}