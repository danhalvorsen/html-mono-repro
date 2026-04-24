export interface PipelineHandlerSuccess<TData> {
  readonly ok: true;
  readonly data: TData;
}

export interface PipelineHandlerFailure {
  readonly ok: false;
  readonly status: number;
  readonly error: string;
}

export type PipelineHandlerResult<TData> =
  | PipelineHandlerSuccess<TData>
  | PipelineHandlerFailure;
