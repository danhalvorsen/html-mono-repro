import "reflect-metadata";
import { inject as inversifyInject, interfaces } from "inversify";

/**
 * Flexible @Inject that accepts constructor | symbol | string
 * Strings resolve to Symbol.for('myioc:Name').
 */
// Exported API uses 'any' to avoid leaking inversify internal type names in declarations.
export function Inject(id: any | string): ParameterDecorator {
	const resolved =
		typeof id === "string"
			? ((Symbol.for(`myioc:${id}`) as unknown) as interfaces.ServiceIdentifier<any>)
			: id;

	// match ParameterDecorator: propertyKey can be undefined and parameterIndex is a number
	return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		(inversifyInject(resolved) as unknown as ParameterDecorator)(target, propertyKey, parameterIndex);
	};
}
