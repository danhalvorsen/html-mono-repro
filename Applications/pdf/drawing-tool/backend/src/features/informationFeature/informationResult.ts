import { Err, Ok, type Result } from '@monorepo/core-design-patterns';

export interface InformationResultPayload<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly type: 'information';
  readonly payload: TPayload;
}

export type InformationResult<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = Result<InformationResultPayload<TPayload>, string>;

export function okInformationResult<TPayload extends Record<string, unknown>>(
  payload: TPayload,
): InformationResult<TPayload> {
  return Ok({
    type: 'information',
    payload,
  });
}

export function errInformationResult<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(reason: string): InformationResult<TPayload> {
  return Err(reason);
}
