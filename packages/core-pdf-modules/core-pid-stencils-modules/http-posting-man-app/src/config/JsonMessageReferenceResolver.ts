import path from "node:path";
import {
  JsonMessageKind,
  type JsonMessageKind as JsonMessageKindType,
  type LoadedPostingConfiguration,
  type NamedJsonMessageReference,
  type ResolvedJsonMessage,
} from "./PostingConfiguration.js";

export interface IJsonMessageReferenceResolver {
  resolve(
    configuration: LoadedPostingConfiguration,
    kind: JsonMessageKindType,
    name: string,
  ): ResolvedJsonMessage;

  resolveQuick(
    configuration: LoadedPostingConfiguration,
    quickName: string,
  ): ResolvedJsonMessage;
}

interface MatchCandidate {
  readonly kind: JsonMessageKindType;
  readonly reference: NamedJsonMessageReference;
}

export class JsonMessageReferenceResolver implements IJsonMessageReferenceResolver {
  public resolve(
    configuration: LoadedPostingConfiguration,
    kind: JsonMessageKindType,
    name: string,
  ): ResolvedJsonMessage {
    const references = this.selectReferences(configuration, kind);
    const normalizedName = this.normalize(name);

    const reference = references.find((candidate) =>
      this.matches(candidate, normalizedName),
    );

    if (reference === undefined) {
      throw new Error(`No ${kind} message is configured with name or shortcut: ${name}`);
    }

    return this.toResolvedMessage(configuration, kind, reference);
  }

  public resolveQuick(
    configuration: LoadedPostingConfiguration,
    quickName: string,
  ): ResolvedJsonMessage {
    const normalizedQuickName = this.normalize(quickName);

    const matches = [
      ...this.findMatches(
        JsonMessageKind.Command,
        configuration.configuration.commands,
        normalizedQuickName,
      ),
      ...this.findMatches(
        JsonMessageKind.Query,
        configuration.configuration.queries,
        normalizedQuickName,
      ),
    ];

    if (matches.length === 0) {
      throw new Error(`No command or query is configured with quick name: ${quickName}`);
    }

    if (matches.length > 1) {
      const names = matches
        .map((match) => `${match.kind}:${match.reference.name}`)
        .join(", ");

      throw new Error(`Quick name is ambiguous: ${quickName}. Matches: ${names}`);
    }

    const match = matches[0]!;
    return this.toResolvedMessage(configuration, match.kind, match.reference);
  }

  private findMatches(
    kind: JsonMessageKindType,
    references: readonly NamedJsonMessageReference[],
    normalizedName: string,
  ): readonly MatchCandidate[] {
    return references
      .filter((reference) => this.matches(reference, normalizedName))
      .map((reference) => ({
        kind,
        reference,
      }));
  }

  private matches(
    reference: NamedJsonMessageReference,
    normalizedName: string,
  ): boolean {
    if (this.normalize(reference.name) === normalizedName) {
      return true;
    }

    return this.readShortcuts(reference)
      .some((shortcut) => this.normalize(shortcut) === normalizedName);
  }

  private readShortcuts(reference: NamedJsonMessageReference): readonly string[] {
    const shortcuts = reference.shortcuts;

    if (shortcuts === undefined) {
      return [];
    }

    if (typeof shortcuts === "string") {
      return shortcuts
        .replace(/^\s*\[/u, "")
        .replace(/\]\s*$/u, "")
        .split(",")
        .map((value: string) => value.trim())
        .filter((value: string) => value.length > 0);
    }

    return [...shortcuts];
  }

  private selectReferences(
    configuration: LoadedPostingConfiguration,
    kind: JsonMessageKindType,
  ): readonly NamedJsonMessageReference[] {
    if (kind === JsonMessageKind.Command) {
      return configuration.configuration.commands;
    }

    if (kind === JsonMessageKind.Query) {
      return configuration.configuration.queries;
    }

    throw new Error(`Unsupported message kind: ${kind}`);
  }

  private toResolvedMessage(
    configuration: LoadedPostingConfiguration,
    kind: JsonMessageKindType,
    reference: NamedJsonMessageReference,
  ): ResolvedJsonMessage {
    return {
      kind,
      name: reference.name,
      baseUrl: configuration.configuration.baseUrl,
      messageFilePath: path.resolve(configuration.configDirectory, reference.path),
    };
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}