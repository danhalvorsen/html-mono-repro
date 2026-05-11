import "reflect-metadata";
import {
  optional as inversifyOptional,
  inject as inversifyInject,
  type interfaces,
} from "inversify";

/**
 * Legacy optional decorator helper.
 *
 * The new façade does not expose decorators.
 */
export class OptionalDecorators {
  public static Optional(id?: interfaces.ServiceIdentifier | string): ParameterDecorator {
    if (id === undefined) {
      return inversifyOptional() as unknown as ParameterDecorator;
    }

    return (
      target: object,
      propertyKey: string | symbol | undefined,
      parameterIndex: number,
    ) => {
      const resolved =
        typeof id === "string"
          ? Symbol.for(`myioc:${id}`)
          : id;

      (inversifyOptional() as unknown as ParameterDecorator)(
        target,
        propertyKey,
        parameterIndex,
      );

      (inversifyInject(resolved) as unknown as ParameterDecorator)(
        target,
        propertyKey,
        parameterIndex,
      );
    };
  }
}

export const Optional = OptionalDecorators.Optional;