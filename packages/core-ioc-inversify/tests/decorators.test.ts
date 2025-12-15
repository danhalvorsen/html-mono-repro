import "reflect-metadata";
 
import { describe, expect, test } from "vitest";
import { Inject, Optional } from "../src/index.js";

describe("decorators - basic behavior", () => {
	test("Optional() returns a ParameterDecorator and can be invoked on constructor params", () => {
		const dec = Optional();
		expect(typeof dec).toBe("function");

		class Dummy {} // no decorator syntax applied here

		// simulate invocation: constructor param (valid for inversify)
		expect(() => {
			(dec as ParameterDecorator)(Dummy as any, undefined, 0);
		}).not.toThrow();
	});

	test("Optional('name') turns a ParameterDecorator and can be invoked on constructor params", () => {
		const dec = Optional("my-service");
		expect(typeof dec).toBe("function");

		class Dummy {} // no decorator syntax applied here

		expect(() => {
			(dec as ParameterDecorator)(Dummy as any, undefined, 0);
		}).not.toThrow();
	});

	test("Inject('id') returns a ParameterDecorator and can be invoked on constructor params", () => {
		const dec = Inject("some-service");
		expect(typeof dec).toBe("function");

		class Dummy {} // no decorator syntax applied here

		expect(() => {
			(dec as ParameterDecorator)(Dummy as any, undefined, 0);
		}).not.toThrow();
	});
});
