export interface RasterGraphicsNoiceContext {
  readonly image: Buffer;
  readonly width: number;
  readonly height: number;
  readonly parameters: Record<string, unknown>;
}

export interface IRasterGraphicsNoiceStrategy {
  readonly name: string;
  apply(context: RasterGraphicsNoiceContext): Promise<Buffer>;
}