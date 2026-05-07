export const GenerationState = {
  Idle: "idle",
  Running: "running",
  Completed: "completed",
  Failed: "failed",
} as const;

export type GenerationState = typeof GenerationState[keyof typeof GenerationState];

export interface GenerationError {
  readonly sourceFile: string;
  readonly message: string;
}

export interface GenerationStatus {
  readonly state: GenerationState;
  readonly startedAtUtc: string | undefined;
  readonly completedAtUtc: string | undefined;
  readonly sourceFiles: number;
  readonly generatedFiles: number;
  readonly errors: readonly GenerationError[];
}