// packages/core-json/src/Json.ts

export class Json {
  private constructor() {}

  public static serialize(value: Json.Value): string {
    try {
      const result = JSON.stringify(value);
      if (result === undefined) {
        throw new Error(Json.Errors.SerializeFailed);
      }

      return result;
    } catch {
      throw new Error(Json.Errors.SerializeFailed);
    }
  }

  public static deserialize<T = Json.Value>(json: string): T {
    try {
      return JSON.parse(json) as T;
    } catch {
      throw new Error(Json.Errors.DeserializeFailed);
    }
  }
}

export namespace Json {
  export const Errors = {
    SerializeFailed: 'JSON_SERIALIZE_FAILED',
    DeserializeFailed: 'JSON_DESERIALIZE_FAILED',
  } as const;

  export type Primitive = string | number | boolean | null;

  export type Value =
    | Primitive
    | Object
    | Array;

  export interface Object {
    readonly [key: string]: Value;
  }

  export type Array = ReadonlyArray<Value>;
}
