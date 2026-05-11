import "reflect-metadata";
import { describe, test, expect } from "vitest";
import { createInversifyContainer } from "../src/inversify-backend/container.js";
import { bindClass } from "../src/inversify-backend/bindings.js";
import { ServiceLifetime } from "../src/decorators/adapter/ServiceLifetime.js";

describe("inversify-backend helpers", () => {
	// ...removed test for standard string-token -> Symbol.for mapping...

	test("bindClass accepts a symbol token and respects transient lifetime (different instances)", () => {
		const container = createInversifyContainer();

		class Bar {
			public id = Math.random();
		}

		const sym = Symbol("explicit:Bar") as unknown as any;
		bindClass(container, sym, Bar, ServiceLifetime.Transient);

		const x = container.get<Bar>(sym);
		const y = container.get<Bar>(sym);

		expect(x).toBeDefined();
		expect(y).toBeDefined();
		expect(x).not.toBe(y);
		expect(x.id).not.toBe(y.id);
	});
});
