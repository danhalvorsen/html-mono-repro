import "reflect-metadata";
import { describe, expect, test } from "vitest";
import { createAdapter, resolveIdentifierKey, bindManyTransient, resolveRandomMany, bindAndGetExample } from "./fixtures/containerAdapter.fixture.js";
import { ServiceLifetime } from "../src/decorators/adapter/ServiceLifetime.js";

describe("ContainerAdapter - integration & stress (using fixture)", () => {
	test("resolveIdentifier maps string tokens to Symbol.for('myioc:Name')", () => {
		const adapter = createAdapter();
		const { symbol, key } = resolveIdentifierKey(adapter, "MyService");
		expect(typeof symbol).toBe("symbol");
		expect(key).toBe("myioc:MyService");
	});

	test("bind/get works with string token (mapped) and symbol token", () => {
		const adapter = createAdapter();

		// use fixture helper to perform bindings and obtain instances
		const { a, b, c1, c2 } = bindAndGetExample(adapter);

		expect(a).toBe(b);
		expect(a.id).toBe(b.id);
		expect(c1).not.toBe(c2);
	});

	test("stress: many bindings and many concurrent resolves (no exceptions)", async () => {
		const adapter = createAdapter();
		const TOTAL_SERVICES = 200;
		const RESOLVE_OPS = 1000;

		bindManyTransient(adapter, TOTAL_SERVICES, "Svc");

		const results = await resolveRandomMany(adapter, TOTAL_SERVICES, RESOLVE_OPS, "Svc");
		expect(results.length).toBe(RESOLVE_OPS);
		for (const r of results) {
			expect(typeof r).toBe("object");
			expect(r).not.toBeNull();
		}
	}, 20_000);
});
ServiceLifetime