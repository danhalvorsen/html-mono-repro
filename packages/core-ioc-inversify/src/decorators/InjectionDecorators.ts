 import "reflect-metadata";
import { inject as inversifyInject, interfaces } from "inversify";

/**
 * Encapsulate the inject decorator in a class to avoid top-level function return-type leaks.
 * Static method returns a standard ParameterDecorator to prevent TypeScript from emitting
 * Inversify internal types in declaration files.
 */
export class InjectionDecorators {
  static Inject(id: interfaces.ServiceIdentifier<any> | string): ParameterDecorator {
    const resolved =
      typeof id === "string"
        ? ((Symbol.for(`myioc:${id}`) as unknown) as interfaces.ServiceIdentifier<any>)
        : id;
    return (inversifyInject(resolved) as unknown) as ParameterDecorator;
  }
}
