export interface RenderContext {
  readonly width: number;
  readonly height: number;
  readonly selectedObjectId: string | null;
  readonly selectedPointId: string | null;
}
