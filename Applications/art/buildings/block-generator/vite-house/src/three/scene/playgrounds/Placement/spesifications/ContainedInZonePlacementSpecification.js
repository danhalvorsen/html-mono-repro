export class ContainedInZonePlacementSpecification {
    zone;
    constructor(zone) {
        this.zone = zone;
    }
    isSatisfiedBy(context) {
        return context.candidate.bounds.getVertices().every((vertex) => this.zone.bounds.contains(vertex));
    }
}
//# sourceMappingURL=ContainedInZonePlacementSpecification.js.map