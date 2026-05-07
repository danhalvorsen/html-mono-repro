export const JsonMessageKind = {
  Command: "command",
  Query: "query",
} as const;

export type JsonMessageKind =
  typeof JsonMessageKind[keyof typeof JsonMessageKind];

export interface NamedJsonMessageReference {
  readonly name: string;
  readonly path: string;
  readonly shortcuts?: readonly string[] | string;
}

export interface PostingConfiguration {
  readonly baseUrl: string;
  readonly commands: readonly NamedJsonMessageReference[];
  readonly queries: readonly NamedJsonMessageReference[];
}

export interface LoadedPostingConfiguration {
  readonly configFilePath: string;
  readonly configDirectory: string;
  readonly configuration: PostingConfiguration;
}

export interface ResolvedJsonMessage {
  readonly kind: JsonMessageKind;
  readonly name: string;
  readonly baseUrl: string;
  readonly messageFilePath: string;
}