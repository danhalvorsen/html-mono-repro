import "reflect-metadata";
import { describe, expect, test } from "vitest";
import { ContainerAdapter } from "../src/decorators/adapter/ContainerAdapter.js";
import { ServiceLifetime } from "../src/decorators/adapter/ServiceLifetime.js";

describe("ContainerAdapter - clear/dispose and symbol behavior", () => {
	test("clear() resets container state so re-binding produces new singleton instances", () => {
		const adapter = new ContainerAdapter();

		class Foo {
			public id = Math.random();
		}

		adapter.bind("FooService", Foo, ServiceLifetime.Singleton);
		const first = adapter.get("FooService") as Foo;
		expect(first).toBeDefined();

		// clear should drop the singleton so re-binding yields a different instance
		adapter.clear();

		adapter.bind("FooService", Foo, ServiceLifetime.Singleton);
		const second = adapter.get("FooService") as Foo;

		expect(second).toBeDefined();
		expect(second).not.toBe(first);
	});

	test("dispose() is an alias for clear()", () => {
		const adapter = new ContainerAdapter();

		class Foo {
			public id = Math.random();
		}

		adapter.bind("FooService", Foo, ServiceLifetime.Singleton);
		const first = adapter.get("FooService") as Foo;
		expect(first).toBeDefined();

		adapter.dispose(); // alias

		adapter.bind("FooService", Foo, ServiceLifetime.Singleton);
		const second = adapter.get("FooService") as Foo;

		expect(second).toBeDefined();
		expect(second).not.toBe(first);
	});

	test("useGlobalSymbols: false uses non-interned Symbol() (Symbol.keyFor returns undefined) and bind/get works", () => {
		const adapter = new ContainerAdapter({ useGlobalSymbols: false });

		// inspect resolved identifier
		const resolved = (adapter as any).resolveIdentifier("TransientSvc");
		expect(typeof resolved).toBe("symbol");
		// non-interned symbols have no key in the global registry
		expect(Symbol.keyFor(resolved)).toBeUndefined();

		class Svc {
			public id = Math.random();
		}

		adapter.bind("TransientSvc", Svc, ServiceLifetime.Transient);
		const a = adapter.get("TransientSvc");
		const b = adapter.get("TransientSvc");

		// transient scope -> different instances
		expect(a).not.toBe(b);
	});
});
