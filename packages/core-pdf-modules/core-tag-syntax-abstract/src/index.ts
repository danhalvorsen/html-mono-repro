export { TagSyntaxErrorMessages } from "./errors/TagSyntaxErrorMessages.js";

export type { ITagTextNormalizer } from "./normalization/ITagTextNormalizer.js";
export { DefaultTagTextNormalizer } from "./normalization/DefaultTagTextNormalizer.js";

export type { ITagSyntax } from "./syntax/ITagSyntax.js";
export type { ITagSyntaxRegistry } from "./syntax/ITagSyntaxRegistry.js";
export type {
  TagSyntaxGroups,
  TagSyntaxMatch,
  TagSyntaxParseResult,
} from "./syntax/TagSyntaxParseResult.js";
export { RegexTagSyntaxBase } from "./syntax/RegexTagSyntaxBase.js";
export { TagSyntaxRegistry } from "./syntax/TagSyntaxRegistry.js";

export { TagSyntaxMatchesTextSpecification } from "./specifications/TagSyntaxMatchesTextSpecification.js";
export { TagSyntaxRegistryMatchesTextSpecification } from "./specifications/TagSyntaxRegistryMatchesTextSpecification.js";
export { TagSyntaxGroupEqualsSpecification } from "./specifications/TagSyntaxGroupEqualsSpecification.js";
export { TagSyntaxGroupMatchesSpecification } from "./specifications/TagSyntaxGroupMatchesSpecification.js";
export { TagSyntaxResultMatchedSpecification } from "./specifications/TagSyntaxResultMatchedSpecification.js";
export { TagSyntaxResultSyntaxIdSpecification } from "./specifications/TagSyntaxResultSyntaxIdSpecification.js";