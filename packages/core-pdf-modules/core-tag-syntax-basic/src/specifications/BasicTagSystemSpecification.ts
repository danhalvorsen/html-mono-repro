import { Specification } from "@monorepo/core-specifications";
import { BasicTagSyntaxRegistryFactory } from "../syntax/BasicTagSyntaxRegistryFactory.js";

export class BasicTagSystemSpecification extends Specification<string> {
  private readonly registry = new BasicTagSyntaxRegistryFactory().create();

  public constructor(private readonly expectedSystem: string) {
    super();

    if (expectedSystem.trim().length === 0) {
      throw new Error("expectedSystem must not be empty.");
    }
  }

  public override isSatisfiedBy(candidate: string): boolean {
    const result = this.registry.findFirst(candidate);

    if (result === null || !result.matched) {
      return false;
    }

    return result.match.groups.system === this.expectedSystem;
  }
}