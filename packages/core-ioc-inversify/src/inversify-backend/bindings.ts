import { Container, interfaces } from "inversify";
import { ServiceLifetime } from "../decorators/adapter/ServiceLifetime.js";
import { Token } from "../decorators/adapter/Token.js";

/**
 * Helper: bind a class into container with a lifetime.
 *
 * Overloads supported:
 * - bindClass(container, identifier, ctor, lifetime)
 * - bindClass(container, ctor, lifetime)           // uses ctor itself as the token
 */
export function bindClass<T>(
	container: Container,
	identifierOrCtor: Token<T> | string | (new (...args: any[]) => T),
	ctorOrLifetime: any,
	lifetimeArg?: ServiceLifetime
) {
	// normalize arguments to (identifier, ctor, lifetime)
	let identifier: Token<T> | string;
	let ctor: new (...args: any[]) => T;
	let lifetime: ServiceLifetime;

	if (typeof ctorOrLifetime === "function" && lifetimeArg !== undefined) {
		// form: (container, identifier, ctor, lifetime)
		identifier = identifierOrCtor as Token<T> | string;
		ctor = ctorOrLifetime as new (...args: any[]) => T;
		lifetime = lifetimeArg as ServiceLifetime;
	} else {
		// form: (container, ctor, lifetime)  -- use ctor as token
		ctor = identifierOrCtor as new (...args: any[]) => T;
		lifetime = ctorOrLifetime as ServiceLifetime;
		identifier = ctor as unknown as Token<T> | string;
	}

	// simple, deterministic mapping for string tokens
	const id: interfaces.ServiceIdentifier<T> =
		typeof identifier === "string"
			? ((Symbol.for(`myioc:${identifier}`) as unknown) as interfaces.ServiceIdentifier<T>)
			: typeof identifier === "function"
			? (identifier as unknown as interfaces.ServiceIdentifier<T>)
			: (identifier as interfaces.ServiceIdentifier<T>);

	// opt-in singleton policy (default: disabled)
	const ALLOW_SINGLETONS = process.env.ALLOW_SINGLETONS === "1";
	if (lifetime === ServiceLifetime.Singleton && !ALLOW_SINGLETONS) {
		throw new Error("Singleton lifetime is disabled by policy. Set ALLOW_SINGLETONS=1 to opt-in.");
	}

	const binding = container.bind<T>(id).to(ctor as any);
	switch (lifetime) {
		case ServiceLifetime.Singleton:
			binding.inSingletonScope();
			break;
		case ServiceLifetime.Scoped:
			binding.inRequestScope();
			break;
		default:
			binding.inTransientScope();
			break;
	}
}Container