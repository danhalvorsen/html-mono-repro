export class InsideHostPlacementSpecification {
    isSatisfiedBy(context) {
        return context.candidate.bounds.getVertices().every((vertex) => context.host.contains(vertex));
    }
}
//# sourceMappingURL=InsideHostPlacementSpecification.js.map