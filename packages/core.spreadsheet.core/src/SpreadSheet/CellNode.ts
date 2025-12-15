
export const VALUE_NUMBER   = Symbol("number");
export const VALUE_STRING   = Symbol("string");
export const VALUE_BOOLEAN  = Symbol("boolean");
export const VALUE_DATE     = Symbol("date");
export const VALUE_NULL     = Symbol("null");

export const enum ValueKind {
  Number,
  String,
  Boolean,
  Date,
  Null,
}
 
export interface ValueType {
  kind: ValueKind;
  value: number | string | boolean | Date | null;
}

export const V = {
  num: (n: number): ValueType => ({ kind: ValueKind.Number, value: n }),
  str: (s: string): ValueType => ({ kind: ValueKind.String, value: s }),
  bool: (b: boolean): ValueType => ({ kind: ValueKind.Boolean, value: b }),
  date: (d: Date): ValueType => ({ kind: ValueKind.Date, value: d }),
  nul: (): ValueType => ({ kind: ValueKind.Null, value: null }),
};
 
export interface StringValue {
  kind: typeof VALUE_STRING;
  value: string;
}

export interface BooleanValue {
  kind: typeof VALUE_BOOLEAN;
  value: boolean;
}

export interface DateValue {
  kind: typeof VALUE_DATE;
  value: Date;
}