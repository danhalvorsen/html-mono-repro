import crypto from "crypto";
import fs from "fs";

/**
 * TokenHasher: simple, deterministic hash of two strings with collision checks.
 *
 * Usage:
 *  const suffix = TokenHasher.getHash("myioc", "SomeIdentifier");
 *  const sym = TokenHasher.symbolFor("myioc", "SomeIdentifier");
 *
 * Behavior:
 *  - Produces a short hex suffix (8 chars) by default.
 *  - If that suffix collides with a previously-registered different input pair,
 *    it will try longer prefixes of the full SHA256 digest (16, 32, 64 hex chars).
 *  - If collisions persist (extremely unlikely), it appends a numeric counter.
 *  - Registry keeps suffix -> original composite mapping for uniqueness.
 */
export class TokenHasher {
	// internal registry: suffix -> compositeInput
	private static registry: Map<string, string> = new Map();
	// telemetry
	private static callsCount = 0;
	private static collisionsCount = 0;

	// compute full SHA256 hex digest of the composite string
	private static fullHex(a: string, b: string): string {
		const composite = `${a}|${b}`;
		return crypto.createHash("sha256").update(composite).digest("hex");
	}

	// simple: use first 8 hex chars as base suffix
	private static baseSuffix(full: string): string {
		return full.slice(0, 8);
	}

	// produce a unique suffix; on collision try counter-appended variants
	static getHash(a: string, b: string): string {
		const composite = `${a}|${b}`;
		const full = TokenHasher.fullHex(a, b);
		const base = TokenHasher.baseSuffix(full);

		// if not used, reserve and return
		const existing = TokenHasher.registry.get(base);
		if (!existing) {
			TokenHasher.registry.set(base, composite);
			return base;
		}
		if (existing === composite) {
			return base; // same mapping already present
		}

		// record a collision attempt when base is already used by different composite
		TokenHasher.collisionsCount++;

		// collision with different composite -> try counter variants
		for (let i = 1; i <= 1000; i++) {
			const candidate = `${base}_${i}`;
			const ex = TokenHasher.registry.get(candidate);
			if (!ex) {
				TokenHasher.registry.set(candidate, composite);
				return candidate;
			}
			if (ex === composite) {
				return candidate;
			}
		}

		// fallback: use longer prefix of full digest
		for (const len of [16, 32, 64]) {
			const candidate = full.slice(0, len);
			const ex = TokenHasher.registry.get(candidate);
			if (!ex) {
				TokenHasher.registry.set(candidate, composite);
				return candidate;
			}
			if (ex === composite) {
				return candidate;
			}
		}

		// extreme fallback: append a random suffix until unique
		while (true) {
			const rand = crypto.randomBytes(4).toString("hex");
			const candidate = `${base}_${rand}`;
			if (!TokenHasher.registry.has(candidate)) {
				TokenHasher.registry.set(candidate, composite);
				return candidate;
			}
		}
	}

	// convenience: produce a global symbol for a pair (namespace, identifier)
	static symbolFor(a: string, b: string): symbol {
		// telemetry: increment call count
		TokenHasher.callsCount++;
		const suffix = TokenHasher.getHash(a, b);
		return Symbol.for(`myioc:${suffix}`);
	}

	// optional: expose registry snapshot for diagnostics
	static debugRegistry(): ReadonlyMap<string, string> {
		return new Map(TokenHasher.registry);
	}

	// optional: clear registry explicitly if caller needs to (e.g., on deliberate migration)
	static resetRegistry(): void {
		TokenHasher.registry.clear();
		TokenHasher.callsCount = 0;
		TokenHasher.collisionsCount = 0;
	}

	// telemetry getters and persistence
	static getStats() {
		return {
			calls: TokenHasher.callsCount,
			collisions: TokenHasher.collisionsCount,
			registrySize: TokenHasher.registry.size,
		};
	}

	static writeStats(filePath: string) {
		const stats = TokenHasher.getStats();
		try {
			fs.writeFileSync(filePath, JSON.stringify(stats, null, 2), "utf8");
		} catch {
			// ignore errors in tests
		}
	}
}
