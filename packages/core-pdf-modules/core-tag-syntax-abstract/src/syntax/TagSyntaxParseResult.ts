export type TagSyntaxGroups<TKey extends string = string> =
  Readonly<Record<TKey, string | undefined>>;

export type TagSyntaxMatch<TKey extends string = string> = Readonly<{
  syntaxId: string;
  rawText: string;
  normalizedText: string;
  groups: TagSyntaxGroups<TKey>;
}>;

export type TagSyntaxParseResult<TKey extends string = string> =
  | Readonly<{
      matched: true;
      match: TagSyntaxMatch<TKey>;
    }>
  | Readonly<{
      matched: false;
      syntaxId: string;
      rawText: string;
      normalizedText: string;
    }>;