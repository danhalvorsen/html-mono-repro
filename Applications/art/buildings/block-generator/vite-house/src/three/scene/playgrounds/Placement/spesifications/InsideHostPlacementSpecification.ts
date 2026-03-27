import type { IPlacementContext } from "@monorepo/core-rectangle-placement";

export class InsideHostPlacementSpecification {
  public isSatisfiedBy(context: IPlacementContext): boolean {
    return context.candidate.bounds.getVertices().every((vertex) => context.host.contains(vertex)
    );
  }
}
