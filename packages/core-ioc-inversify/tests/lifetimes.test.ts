import "reflect-metadata";
 
import { describe, expect, test } from "vitest";
import { Inject, Optional } from "core-ioc-inversify/src/index.js";
import { Container, injectable } from "inversify";

describe("lifetimes - Inversify binding scopes", () => {
	test("singleton binding returns the same instance", () => {
		const container = new Container();

		@injectable()
		class Foo {
			public id = Math.random();
		}

		container.bind<Foo>("FooSingleton").to(Foo).inSingletonScope();

		const a = container.get<Foo>("FooSingleton");
		const b = container.get<Foo>("FooSingleton");

		expect(a).toBe(b);
		expect(a.id).toBe(b.id);
	});

	test("transient binding returns different instances", () => {
		const container = new Container();

		@injectable()
		class Bar {
			public id = Math.random();
		}

		container.bind<Bar>("BarTransient").to(Bar).inTransientScope();

		const a = container.get<Bar>("BarTransient");
		const b = container.get<Bar>("BarTransient");

		expect(a).not.toBe(b);
		expect(a.id).not.toBe(b.id);
	});
});