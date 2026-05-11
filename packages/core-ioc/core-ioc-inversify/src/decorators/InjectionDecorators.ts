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
export class InjectionDecorators {
  public static Inject(id: interfaces.ServiceIdentifier | string): ParameterDecorator {
    const resolved =
      typeof id === "string"
        ? Symbol.for(`myioc:${id}`)
        : id;

    return inversifyInject(resolved) as unknown as ParameterDecorator;
  }
}