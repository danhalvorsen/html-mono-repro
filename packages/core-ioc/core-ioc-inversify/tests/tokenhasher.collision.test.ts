import "reflect-metadata";
import crypto from "crypto";
import { describe, test } from "vitest";
import path from "path";
import fs from "fs";
import { TokenHasher } from "../src/decorators/adapter/TokenHasher.js";

describe("TokenHasher - collision detection", () => {
	test(
		"no collisions for many generated identifiers (fail if suffix reused for different ids)",
		{ timeout: Number(process.env.SERVICE_HASH_TEST_TIMEOUT_MS) || 120_000 },
		() => {
			const COUNT = Math.max(1, Number(process.env.SERVICE_HASH_TEST_COUNT) || 10000);
			const suffixSet = new Set<string>();

			for (let i = 0; i < COUNT; i++) {
				const rand = crypto.randomBytes(8).toString("hex");
				const identifier = `test-${i}-${rand}`;

				const sym = TokenHasher.symbolFor(identifier);
				const key = Symbol.keyFor(sym);
				if (!key) {
					throw new Error("symbol key not retrievable (expected global symbol)");
				}
				// key format: "myioc:<suffix>"
				const suffix = key.split(":").slice(1).join(":");
				suffixSet.add(suffix);
			}

			// persist TokenHasher stats for report
			const statsPath = path.resolve(__dirname, "tokenhasher_stats.json");
			TokenHasher.writeStats(statsPath);

			// Read and print the stats so they appear in test logs
			try {
				const raw = fs.readFileSync(statsPath, "utf8");
				// pretty-print parsed JSON
				const parsed = JSON.parse(raw);
				console.log("TokenHasher stats:", JSON.stringify(parsed, null, 2));
			} catch (err) {
				console.warn("Failed to read tokenhasher stats:", err);
			}

			// All generated identifiers must map to unique suffixes (TokenHasher must avoid duplicates)
			if (suffixSet.size !== COUNT) {
				throw new Error(`Detected ${COUNT - suffixSet.size} duplicate suffixes for ${COUNT} identifiers`);
			}
		}
	);
});
