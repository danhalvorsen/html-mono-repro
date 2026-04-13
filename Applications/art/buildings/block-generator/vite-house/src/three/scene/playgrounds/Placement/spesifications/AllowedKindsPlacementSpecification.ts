import type { IPlacementContext } from "@monorepo/core-rectangle-placement";

export class AllowedKindsPlacementSpecification {
  public constructor(
    private readonly allowedKinds: readonly { readonly value: string; }[]
  ) { }

  public isSatisfiedBy(context: IPlacementContext): boolean {
    return this.allowedKinds.some(
      (kind) => kind.value === context.candidate.kind.value
    );
  }
}
