export type DispatchResponseBody<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string };

export interface DispatchResult<TData> {
  readonly status: number;
  readonly body: DispatchResponseBody<TData>;
}
