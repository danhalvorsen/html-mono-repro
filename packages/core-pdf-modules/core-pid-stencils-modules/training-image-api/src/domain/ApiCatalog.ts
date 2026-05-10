export const ApiMessageKind = {
  Command: "command",
  Query: "query",
} as const;

export type ApiMessageKind =
  typeof ApiMessageKind[keyof typeof ApiMessageKind];

export interface ApiFieldDescription {
  readonly name: string;
  readonly required: boolean;
  readonly type: string;
  readonly description: string;
}

export interface ApiMessageDescription {
  readonly type: string;
  readonly kind: ApiMessageKind;
  readonly endpoint: string;
  readonly description: string;
  readonly fields: readonly ApiFieldDescription[];
  readonly exampleRequestBody: unknown;
}

export interface ApiEndpointDescription {
  readonly method: "POST";
  readonly path: string;
  readonly description: string;
}

export interface ApiCatalog {
  readonly serviceName: string;
  readonly schemaVersion: number;
  readonly endpoints: readonly ApiEndpointDescription[];
  readonly commands: readonly ApiMessageDescription[];
  readonly queries: readonly ApiMessageDescription[];
}