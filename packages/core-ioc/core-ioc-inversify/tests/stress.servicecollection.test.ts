import "reflect-metadata";
import { describe, test } from "vitest";
import { ServiceCollection } from "../src/ico.js";

/*
  Stress test for ServiceCollection (ioc).
  - Configure via env:
      SERVICE_COLLECTION_STRESS  -> number of services to register (default 10000)
      SERVICE_COLLECTION_OPS     -> number of resolve operations (default = SERVICE_COLLECTION_STRESS)
  - To run 1_000_000: SERVICE_COLLECTION_STRESS=1000000 SERVICE_COLLECTION_OPS=1000000 pnpm vitest run tests/stress.servicecollection.test.ts --run
*/

describe("ServiceCollection - stress test (configurable)", () => {
	test(
		"register and resolve many services (configurable via env)",
		{ timeout: 120_0000 },
		async () => {
			const TOTAL = Math.max(1, Number(process.env.SERVICE_COLLECTION_STRESS) || 10_000);
			const OPS = Math.max(1, Number(process.env.SERVICE_COLLECTION_OPS) || TOTAL);

			const ioc = new ServiceCollection();

			// create and register many distinct classes
			const ctors: Array<new () => { id: number }> = [];
			for (let i = 0; i < TOTAL; i++) {
				// create lightweight class with captured id
				const C = class {
					public id = i;
				};
				ctors.push(C as any);
				// register as transient to avoid retaining many singletons
				ioc.Add.AddTransient(ctors[i] as any);
			}

			// perform many concurrent resolves
			const ops = Array.from({ length: OPS }, () => {
				const idx = Math.floor(Math.random() * TOTAL);
				return Promise.resolve().then(() => {
					const inst = ioc.Resolve(ctors[idx] as any) as any;
					// basic sanity check
					if (inst == null || typeof inst.id !== "number") {
						throw new Error("invalid instance");
					}
					if (inst.id !== idx) {
						// transient: instance.id is the class-captured index; ensure mapping correct
						throw new Error(`mismatched id. expected ${idx} got ${inst.id}`);
					}
					return inst;
				});
			});

			const results = await Promise.all(ops);
			if (results.length !== OPS) throw new Error("unexpected results length");
		}
	);
});
