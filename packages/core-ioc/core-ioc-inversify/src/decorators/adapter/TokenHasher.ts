/**
 * TokenHasher.
 *
 * Legacy adapter helper.
 *
 * Browser-safe and deterministic:
 * - no Node crypto
 * - no fs
 * - no random fallback
 * - no global process dependency
 *
 * This is still part of the old prototype surface.
 * New Slice 1 code should use the descriptor identity generator under src/new.
 */
export class TokenHasher {
  private static readonly registry: Map<string, string> = new Map();

  private static callsCount = 0;
  private static collisionsCount = 0;

  public static getHash(namespace: string, identifier: string): string {
    const composite = `${namespace}|${identifier}`;
    const base = TokenHasher.createBaseSuffix(composite);

    const existing = TokenHasher.registry.get(base);

    if (existing === undefined) {
      TokenHasher.registry.set(base, composite);
      return base;
    }

    if (existing === composite) {
      return base;
    }

    TokenHasher.collisionsCount++;

    for (
      let collisionIndex = 1;
      collisionIndex < Number.MAX_SAFE_INTEGER;
      collisionIndex++
    ) {
      const collisionSource = `${composite}|${collisionIndex}`;
      const candidate = `${base}_${TokenHasher.createBaseSuffix(collisionSource)}`;
      const candidateExisting = TokenHasher.registry.get(candidate);

      if (candidateExisting === undefined) {
        TokenHasher.registry.set(candidate, composite);
        return candidate;
      }

      if (candidateExisting === composite) {
        return candidate;
      }
    }

    throw new Error("Unable to generate a unique token hash.");
  }

  public static symbolFor(namespace: string, identifier: string): symbol {
    TokenHasher.callsCount++;

    return Symbol.for(`myioc:${TokenHasher.getHash(namespace, identifier)}`);
  }

  public static debugRegistry(): ReadonlyMap<string, string> {
    return new Map(TokenHasher.registry);
  }

  public static resetRegistry(): void {
    TokenHasher.registry.clear();
    TokenHasher.callsCount = 0;
    TokenHasher.collisionsCount = 0;
  }

  public static getStats(): {
    readonly calls: number;
    readonly collisions: number;
    readonly registrySize: number;
  } {
    return {
      calls: TokenHasher.callsCount,
      collisions: TokenHasher.collisionsCount,
      registrySize: TokenHasher.registry.size,
    };
  }

  public static writeStats(_filePath: string): void {
    // Intentionally no-op.
    // Writing files would make this package Node-specific.
  }

  private static createBaseSuffix(value: string): string {
    return TokenHasher.xorHash(value);
  }

  private static xorHash(value: string): string {
    let hash = 0x811c9dc5;

    for (let index = 0; index < value.length; index++) {
      hash = hash ^ value.charCodeAt(index);
      hash = ((hash << 5) | (hash >>> 27)) >>> 0;
    }

    return hash.toString(16).padStart(8, "0");
  }
}