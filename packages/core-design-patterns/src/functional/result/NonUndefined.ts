/**
 * Type representing any value except 'undefined'.
 * This is useful when working with strict null checks, ensuring that a value can be null but not undefined.
 */

export type NonUndefined = {} | null; // eslint-disable-line @typescript-eslint/ban-types

