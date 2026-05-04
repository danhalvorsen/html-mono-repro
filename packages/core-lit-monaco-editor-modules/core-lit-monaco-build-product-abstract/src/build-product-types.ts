export type MonacoBuildProductStatus = "idle" | "running" | "success" | "error";

export interface MonacoBuildExecutionProduct {
  readonly status: "success";
  readonly executedAtIso: string;
  readonly sourceCode: string;
  readonly consoleLines: readonly string[];
  readonly greetingResult?: string;
  readonly durationMs?: number;
  readonly summary?: string;
}

export interface IMonacoBuildProductPresenter {
  presentExecutionProduct(product: MonacoBuildExecutionProduct): void;
  presentBuildFailure(message: string): void;
  clear(): void;
}

export interface BuildExecutionOptions {
  readonly executedAtIso?: string;
  readonly durationMs?: number;
}
