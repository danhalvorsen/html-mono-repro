import "reflect-metadata";
import { ContainerAdapter } from "../../src/decorators/adapter/ContainerAdapter.js";
import { ServiceLifetime } from "../../src/decorators/adapter/ServiceLifetime.js";

/**
 * Lightweight fixture helpers for ContainerAdapter tests.
 */

export function createAdapter(): ContainerAdapter {
	// fresh adapter for each test
	return new ContainerAdapter();
}

export function resolveIdentifierKey(adapter: ContainerAdapter, identifier: string) {
	const resolved = (adapter as any).resolveIdentifier(identifier);
	return {
		symbol: resolved as symbol,
		key: Symbol.keyFor(resolved as symbol),
	};
}

export function bindManyTransient(adapter: ContainerAdapter, total: number, prefix = "Svc") {
	for (let i = 0; i < total; i++) {
		// distinct lightweight classes to avoid accidental sharing
		class Svc {
			public id = i;
		}
		adapter.bind(`${prefix}${i}`, Svc, ServiceLifetime.Transient);
	}
}

export async function resolveRandomMany(adapter: ContainerAdapter, totalServices: number, ops: number, prefix = "Svc") {
	const opsArr = Array.from({ length: ops }, () => {
		const idx = Math.floor(Math.random() * totalServices);
		return Promise.resolve().then(() => adapter.get(`${prefix}${idx}`));
	});
	return Promise.all(opsArr);
}

// New helper: perform the bind/get scenario and return the objects for assertions
export function bindAndGetExample(adapter: ContainerAdapter) {
	// bind with string token -> internal symbol mapping
	class Foo {
		public id = Math.random();
	}
	adapter.bind("FooService", Foo, ServiceLifetime.Singleton);
	const a = adapter.get("FooService") as Foo;
	const container = adapter.build();
	const b = container.get(Symbol.for("myioc:FooService") as any) as Foo;

	// explicit symbol token (used as-is)
	const sym = Symbol.for("explicit:Bar");
	class Bar {}
	adapter.bind(sym as any, Bar, ServiceLifetime.Transient);
	const c1 = adapter.get(sym as any);
	const c2 = adapter.get(sym as any);

	return { a, b, c1, c2 };
}
