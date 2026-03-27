export class AllowedKindsPlacementSpecification {
    allowedKinds;
    constructor(allowedKinds) {
        this.allowedKinds = allowedKinds;
    }
    isSatisfiedBy(context) {
        return this.allowedKinds.some((kind) => kind.value === context.candidate.kind.value);
    }
}
//# sourceMappingURL=AllowedKindsPlacementSpecification.js.map