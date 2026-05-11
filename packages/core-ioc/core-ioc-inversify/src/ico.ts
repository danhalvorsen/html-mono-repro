import "reflect-metadata";
import { Container } from "inversify";
import { ServiceLifetime } from "./decorators/adapter/ServiceLifetime.js";
import { Token } from "./decorators/adapter/Token.js";
import { ContainerAdapter } from "./decorators/adapter/ContainerAdapter.js";

/**
 * C#-style ServiceCollection adapter (public surface uses PascalCase).
 * - Methods require the implementation constructor at runtime.
 * - Identifier can be a Token or plain string.
 */
export class ServiceCollection {
	// allow caller to provide adapter (tests/consumers control lifecycle) or create a default one
	private adapter: ContainerAdapter;

	constructor(adapter?: ContainerAdapter) {
		this.adapter = adapter ?? new ContainerAdapter();
	}

	// PascalCase public API (require impl ctor at runtime)
	AddTransient<TInterface, TImpl extends TInterface>(
		implCtor: new (...args: any[]) => TImpl,
		identifier?: Token<TInterface> | string
	): this {
		const id = (identifier ?? (implCtor as unknown as Token<TInterface>)) as Token<TInterface> | string;
		this.adapter.bind(id as any, implCtor as any, ServiceLifetime.Transient);
		return this;
	}

	AddSingleton<TInterface, TImpl extends TInterface>(
		implCtor: new (...args: any[]) => TImpl,
		identifier?: Token<TInterface> | string
	): this {
		const id = (identifier ?? (implCtor as unknown as Token<TInterface>)) as Token<TInterface> | string;
		this.adapter.bind(id as any, implCtor as any, ServiceLifetime.Singleton);
		return this;
	}

	AddScoped<TInterface, TImpl extends TInterface>(
		implCtor: new (...args: any[]) => TImpl,
		identifier?: Token<TInterface> | string
	): this {
		const id = (identifier ?? (implCtor as unknown as Token<TInterface>)) as Token<TInterface> | string;
		this.adapter.bind(id as any, implCtor as any, ServiceLifetime.Scoped);
		return this;
	}

	// Provide ioc.Add.AddSingleton<...>() style convenience (identifier may be string)
	get Add(): any {
		// explicit 'any' avoids TypeScript inferring an inaccessible 'this' type for the getter
		return {
			AddTransient: <TInterface, TImpl extends TInterface>(
				implCtor: new (...args: any[]) => TImpl,
				identifier?: Token<TInterface> | string
			) => this.AddTransient<TInterface, TImpl>(implCtor, identifier as any),
			AddSingleton: <TInterface, TImpl extends TInterface>(
				implCtor: new (...args: any[]) => TImpl,
				identifier?: Token<TInterface> | string
			) => this.AddSingleton<TInterface, TImpl>(implCtor, identifier as any),
			AddScoped: <TInterface, TImpl extends TInterface>(
				implCtor: new (...args: any[]) => TImpl,
				identifier?: Token<TInterface> | string
			) => this.AddScoped<TInterface, TImpl>(implCtor, identifier as any),
		};
	}

	// PascalCase Build / Resolve to match C#-style contract
	Build(): Container {
		return this.adapter.build();
	}

	Resolve<T>(identifier: Token<T> | string): T {
		return this.adapter.get(identifier as any);
	}
}
