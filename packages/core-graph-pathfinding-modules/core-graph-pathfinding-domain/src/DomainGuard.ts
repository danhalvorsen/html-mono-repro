/* =================================================================================================
   core-graph-pathfinding-domain
   Domain-only module
   - No import statements by request.
   - No dependency on @attr attrName: attrType = value;core-graph.
   - Contains only domain contracts, value objects, and domain services/contracts.
   - Infrastructure adapters to core-graph belong in another module.
   ================================================================================================= */
/* =================================================================================================
   Shared domain guard
   ================================================================================================= */

export class DomainGuard {
    public static againstNullOrUndefined<T>(value: T | null | undefined, name: string): T {
        if (value === null || value === undefined) {
            throw new Error(`${name} cannot be null or undefined.`);
        }

        return value;
    }

    public static againstNullOrWhiteSpace(value: string, name: string): string {
        DomainGuard.againstNullOrUndefined(value, name);

        if (value.trim().length === 0) {
            throw new Error(`${name} cannot be empty or whitespace.`);
        }

        return value;
    }

    public static againstInvalidNumber(value: number, name: string): number {
        if (!Number.isFinite(value)) {
            throw new Error(`${name} must be a finite number.`);
        }

        return value;
    }

    public static againstNegative(value: number, name: string): number {
        if (value < 0) {
            throw new Error(`${name} cannot be negative.`);
        }

        return value;
    }

    public static againstEmptyArray<T>(value: readonly T[], name: string): readonly T[] {
        DomainGuard.againstNullOrUndefined(value, name);

        if (value.length === 0) {
            throw new Error(`${name} cannot be empty.`);
        }

        return value;
    }
}
