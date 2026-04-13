import type { IPlacementZone, IPlacementContext } from "@monorepo/core-rectangle-placement";

export class ContainedInZonePlacementSpecification {
  public constructor(
    private readonly zone: IPlacementZone
  ) { }

  public isSatisfiedBy(context: IPlacementContext): boolean {
    return context.candidate.bounds.getVertices().every((vertex) => this.zone.bounds.contains(vertex)
    );
  }
}
