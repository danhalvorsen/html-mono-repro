import type { CliOptions } from "./CliTypes.js";

export interface IWatcherCliOptionsParser {
  parse(argumentsVector: readonly string[]): CliOptions;
}