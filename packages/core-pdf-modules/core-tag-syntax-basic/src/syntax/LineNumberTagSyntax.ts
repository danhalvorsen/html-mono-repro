import { RegexTagSyntaxBase } from "@monorepo/core-tag-syntax-abstract";
import { BasicTagSyntaxIds } from "./BasicTagSyntaxIds.js";

export type LineNumberTagGroup =
  | "size"
  | "service"
  | "system"
  | "lineNumber"
  | "pipeClass"
  | "code";

export class LineNumberTagSyntax extends RegexTagSyntaxBase<LineNumberTagGroup> {
  public constructor() {
    super({
      syntaxId: BasicTagSyntaxIds.LineNumber,
      pattern:
        /^(?<size>\d{1,3}")-(?<service>[A-Z]{1,8})-(?<system>\d{1,3})-(?<lineNumber>\d{1,6})-(?<pipeClass>[A-Z0-9]{2,12})-(?<code>[A-Z0-9]{1,12})$/u,
    });
  }
}