import "reflect-metadata";
 
import { describe, expect, test } from "vitest";
// Replace package alias import with relative path to local source
import { Inject, Optional } from "../src/index.js";

describe("decorators - basic sanity", () => {
	
	test("Optional() returns a ParameterDecorator and can be invoked", () => {
		const dec = Optional();
		expect(typeof dec).toBe("function");

		class Dummy {}
		expect(() => {
			// simulate constructor parameter decorator: target = Dummy (constructor), propertyKey = undefined, parameterIndex = 0
			(dec as ParameterDecorator)(Dummy as any, undefined as any, 0);
		}).not.toThrow();
	});

	test("Optional('name') returns a ParameterDecorator and can be invoked", () => {
		const dec = Optional("my-service");
		expect(typeof dec).toBe("function");

		class Dummy {}
		expect(() => {
			(dec as ParameterDecorator)(Dummy as any, undefined as any, 0);
		}).not.toThrow();
	});

	test("Inject(...) returns a ParameterDecorator and can be invoked", () => {
		const dec = Inject("some-service");
		expect(typeof dec).toBe("function");

		class Dummy {}
		expect(() => {
			(dec as ParameterDecorator)(Dummy as any, undefined as any, 0);
		}).not.toThrow();
	});
});
