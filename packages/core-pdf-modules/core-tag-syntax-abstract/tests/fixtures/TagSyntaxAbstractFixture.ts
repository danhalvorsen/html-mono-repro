import { RegexTagSyntaxBase } from "../../src/index.js";

type SampleGroups = "system" | "classCode" | "number";

export class SampleTagSyntax extends RegexTagSyntaxBase<SampleGroups> {
  public constructor() {
    super({
      syntaxId: "sample-equipment",
      pattern: /^(?<system>\d{2})-(?<classCode>[A-Z]{1,4})-(?<number>\d{1,6})$/u,
    });
  }
}

export class TagSyntaxAbstractFixture {
  public createSampleSyntax(): SampleTagSyntax {
    return new SampleTagSyntax();
  }
}