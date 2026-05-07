export interface ApiDispatchEnvelope<TData> {
  readonly ok: boolean;
  readonly data?: TData;
  readonly error?: string;
}

export class ApiDispatchEnvelopeReader {
  public read<TData>(body: unknown): ApiDispatchEnvelope<TData> {
    if (typeof body !== "object" || body === null) {
      throw new Error("Invalid API response. Expected JSON object.");
    }

    const candidate = body as Partial<ApiDispatchEnvelope<TData>>;

    if (typeof candidate.ok !== "boolean") {
      throw new Error("Invalid API response. Missing boolean field: ok.");
    }

    return candidate as ApiDispatchEnvelope<TData>;
  }
}