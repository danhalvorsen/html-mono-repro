
/**
 * Token type used across the API.
 * - string: logical interface name -> resolved to Symbol.for("myioc:Name")
 * - symbol: runtime Symbol
 * - constructor: class/constructor used as identifier
 */
export type Token<T = any> = string | symbol | (new (...args: any[]) => T);
