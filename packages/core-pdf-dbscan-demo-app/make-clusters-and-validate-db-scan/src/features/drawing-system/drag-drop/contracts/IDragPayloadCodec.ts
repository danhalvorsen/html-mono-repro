export interface IDragPayloadCodec<TValue> {
    readonly mimeType: string;
    serialize(value: TValue): string;
    tryDeserialize(raw: string | null): TValue | null;
}
