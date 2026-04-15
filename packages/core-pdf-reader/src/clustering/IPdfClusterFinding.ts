export interface IPdfClusterFinding {
  readonly page: number;
  readonly text: string;
  readonly hasPrice: boolean;
  readonly fragmentCount: number;
}
