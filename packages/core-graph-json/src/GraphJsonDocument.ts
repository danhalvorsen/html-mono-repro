export interface GraphJsonDocument {
  readonly nodes: readonly {
    id: string;
    payload: unknown;
  }[];
  readonly edges: readonly {
    sourceId: string;
    targetId: string;
  }[];
}
