import type { IPlacementContext } from "@monorepo/core-rectangle-placement";
export declare class AllowedKindsPlacementSpecification {
    private readonly allowedKinds;
    constructor(allowedKinds: readonly {
        readonly value: string;
    }[]);
    isSatisfiedBy(context: IPlacementContext): boolean;
}
//# sourceMappingURL=AllowedKindsPlacementSpecification.d.ts.map