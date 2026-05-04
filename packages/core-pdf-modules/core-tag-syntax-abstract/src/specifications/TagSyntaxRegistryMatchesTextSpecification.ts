import { Specification } from "@monorepo/core-specifications";
import type { ITagSyntaxRegistry } from "../syntax/ITagSyntaxRegistry.js";

export class TagSyntaxRegistryMatchesTextSpecification extends Specification<string> {
  public constructor(private readonly registry: ITagSyntaxRegistry) {
    super();
  }

  public override isSatisfiedBy(candidate: string): boolean {
    return this.registry.findFirst(candidate) !== null;
  }
}