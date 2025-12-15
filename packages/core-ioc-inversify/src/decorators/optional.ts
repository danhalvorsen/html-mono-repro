import "reflect-metadata";
import { optional as inversifyOptional, inject as inversifyInject } from "inversify";
import type { interfaces } from "inversify";

/**
 * Encapsulated Optional decorator to avoid leaking Inversify internal types in declarations.
 */
export class OptionalDecorators {
	// Accept 'id' as any to avoid exposing inversify internal types in the exported signature.
	static Optional(id?: any | string): ParameterDecorator {
		if (id == null) {
			return inversifyOptional() as unknown as ParameterDecorator;
		}

		// lazily compute resolved identifier inside closure to avoid top-level edges
		return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
			const resolved =
				typeof id === "string"
					? ((Symbol.for(`myioc:${id}`) as unknown) as interfaces.ServiceIdentifier<any>)
					: (id as interfaces.ServiceIdentifier<any>);

			// match ParameterDecorator: propertyKey can be undefined and parameterIndex is a number
			(inversifyOptional() as unknown as ParameterDecorator)(target, propertyKey, parameterIndex);
			(inversifyInject(resolved) as unknown as ParameterDecorator)(target, propertyKey, parameterIndex);
		};
	}
}

// backward-compatible named export
export const Optional = OptionalDecorators.Optional;