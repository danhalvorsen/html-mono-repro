import "reflect-metadata";
import crypto from "crypto";
import { describe, test } from "vitest";
import path from "path";
import fs from "fs";
import { TokenHasher } from "../src/decorators/adapter/TokenHasher.js";

describe("TokenHasher - looped collision detection", () => {
	test(
		"runs until a hash collision occurs or max iterations reached",
		{ timeout: Number(process.env.TOKEN_HASH_LOOP_TIMEOUT_MS) || 300_000 },
		() => {
			const MAX = Math.max(1, Number(process.env.TOKEN_HASH_LOOP_MAX) || 100_000);
			const suffixSet = new Set<string>();

			for (let i = 0; i < MAX; i++) {
				const rand = crypto.randomBytes(8).toString("hex");
				const identifier = `loop-${i}-${rand}`;

				const sym = TokenHasher.symbolFor(identifier);
				const key = Symbol.keyFor(sym);
				if (!key) {
					throw new Error("symbol key not retrievable (expected global symbol)");
				}
				const suffix = key.split(":").slice(1).join(":");

				suffixSet.add(suffix);
			}

			// persist TokenHasher stats for report
			const statsPath = path.resolve(__dirname, "tokenhasher_stats.json");
			TokenHasher.writeStats(statsPath);

			// Read and print the stats so they appear in test logs
			try {
				const raw = fs.readFileSync(statsPath, "utf8");
				const parsed = JSON.parse(raw);
				console.log("TokenHasher stats:", JSON.stringify(parsed, null, 2));
			} catch (err) {
				console.warn("Failed to read tokenhasher stats:", err);
			}

			// Ensure TokenHasher produced unique suffixes for all attempts
			if (suffixSet.size !== MAX) {
				throw new Error(`Detected ${MAX - suffixSet.size} duplicate suffixes after ${MAX} iterations`);
			}
		}
	);
});
