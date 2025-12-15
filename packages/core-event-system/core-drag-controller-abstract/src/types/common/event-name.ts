export type EventName = string & { readonly __brand: unique symbol };

export function defineEventName<T extends string>(name: T): EventName {
  return name as unknown as EventName;
}
