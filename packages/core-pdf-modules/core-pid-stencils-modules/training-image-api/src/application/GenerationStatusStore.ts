import { GenerationState, type GenerationError, type GenerationStatus } from "../domain/GenerationStatus.js";

export class GenerationStatusStore {
  private status: GenerationStatus = {
    state: GenerationState.Idle,
    startedAtUtc: undefined,
    completedAtUtc: undefined,
    sourceFiles: 0,
    generatedFiles: 0,
    errors: [],
  };

  public start(sourceFiles: number): void {
    this.status = {
      state: GenerationState.Running,
      startedAtUtc: new Date().toISOString(),
      completedAtUtc: undefined,
      sourceFiles,
      generatedFiles: 0,
      errors: [],
    };
  }

  public incrementGeneratedFiles(): void {
    this.status = {
      ...this.status,
      generatedFiles: this.status.generatedFiles + 1,
    };
  }

  public addError(error: GenerationError): void {
    this.status = {
      ...this.status,
      errors: [...this.status.errors, error],
    };
  }

  public complete(): void {
    this.status = {
      ...this.status,
      state: this.status.errors.length === 0 ? GenerationState.Completed : GenerationState.Failed,
      completedAtUtc: new Date().toISOString(),
    };
  }

  public get(): GenerationStatus {
    return this.status;
  }
}