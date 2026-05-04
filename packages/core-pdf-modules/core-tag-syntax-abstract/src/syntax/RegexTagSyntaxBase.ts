import { TagSyntaxErrorMessages } from "../errors/TagSyntaxErrorMessages.js";
import { DefaultTagTextNormalizer } from "../normalization/DefaultTagTextNormalizer.js";
import type { ITagTextNormalizer } from "../normalization/ITagTextNormalizer.js";
import type { ITagSyntax } from "./ITagSyntax.js";
import type {
  TagSyntaxGroups,
  TagSyntaxParseResult,
} from "./TagSyntaxParseResult.js";

export abstract class RegexTagSyntaxBase<TKey extends string = string>
  implements ITagSyntax<TKey> {
  public readonly syntaxId: string;

  private readonly normalizer: ITagTextNormalizer;
  private readonly pattern: RegExp;

  protected constructor(params: {
    readonly syntaxId: string;
    readonly pattern: RegExp;
    readonly normalizer?: ITagTextNormalizer;
  }) {
    if (params.syntaxId.trim().length === 0) {
      throw new Error(TagSyntaxErrorMessages.syntaxIdMustNotBeEmpty);
    }

    if (params.pattern.global) {
      throw new Error(TagSyntaxErrorMessages.patternMustNotUseGlobalFlag);
    }

    this.syntaxId = params.syntaxId;
    this.pattern = params.pattern;
    this.normalizer = params.normalizer ?? new DefaultTagTextNormalizer();
  }

  public parse(text: string): TagSyntaxParseResult<TKey> {
    this.ensureText(text);

    const normalizedText = this.normalizer.normalize(text);
    const match = this.pattern.exec(normalizedText);

    if (match === null) {
      return Object.freeze({
        matched: false,
        syntaxId: this.syntaxId,
        rawText: text,
        normalizedText,
      });
    }

    return Object.freeze({
      matched: true,
      match: Object.freeze({
        syntaxId: this.syntaxId,
        rawText: text,
        normalizedText,
        groups: Object.freeze(this.createGroups(match)),
      }),
    });
  }

  protected getRequiredGroup(match: RegExpExecArray, key: TKey): string {
    const value = match.groups?.[key];

    if (value === undefined || value.length === 0) {
      throw new Error(`Required regex group '${key}' was not captured.`);
    }

    return value;
  }

  private createGroups(match: RegExpExecArray): TagSyntaxGroups<TKey> {
    return Object.fromEntries(
      Object.entries(match.groups ?? {}).map(([key, value]) => [key, value]),
    ) as TagSyntaxGroups<TKey>;
  }

  private ensureText(value: string): void {
    if (value.trim().length === 0) {
      throw new Error(TagSyntaxErrorMessages.textMustNotBeEmpty);
    }
  }
}